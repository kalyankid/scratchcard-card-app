import React, { useEffect, useState, useMemo } from "react";
import {
  fetchAllPurchases,
  approvePurchase,
  rejectPurchase,
  adminUploadPaymentScreenshot,
} from "../api";
import { FiRefreshCcw } from "react-icons/fi";


const API_URL = import.meta.env.VITE_API_URL;

export default function PendingPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchAllPurchases();
      const data = (res.data || []).map((p) => ({
        ...p,
        localStatus:
          p.status === "verified"
            ? "approved"
            : p.status === "rejected"
            ? "rejected"
            : "pending",
      }));
      setPurchases(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load pending purchases");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (purchaseId, file) => {
    if (!file) return alert("Please select a file");
    setUploadingId(purchaseId);
    try {
      const formData = new FormData();
      formData.append("purchaseId", purchaseId);
      formData.append("screenshot", file);

      const res = await adminUploadPaymentScreenshot(formData);
      alert(res.data.message || "Screenshot uploaded!");

      setPurchases((prev) =>
        prev.map((p) =>
          p._id === purchaseId
            ? { ...p, paymentScreenshot: res.data.purchase.paymentScreenshot }
            : p
        )
      );
    } catch (err) {
      console.error(err);
      alert("Upload failed. Try again.");
    } finally {
      setUploadingId(null);
    }
  };

  const approve = async (id) => {
    if (!window.confirm("Approve this payment? User will get cards immediately.")) return;
    try {
      await approvePurchase(id);
      setPurchases((prev) =>
        prev.map((p) => (p._id === id ? { ...p, localStatus: "approved" } : p))
      );
    } catch {
      alert("Approve failed");
    }
  };

  const reject = async (id) => {
    if (!window.confirm("Reject this payment? User will be notified.")) return;
    try {
      await rejectPurchase(id);
      setPurchases((prev) =>
        prev.map((p) => (p._id === id ? { ...p, localStatus: "rejected" } : p))
      );
    } catch {
      alert("Reject failed");
    }
  };

  // Filtered & Paginated data
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const fullName =
        `${p.userId?.firstName || ""} ${p.userId?.lastName || ""}`.toLowerCase();
      const email = p.userId?.email?.toLowerCase() || "";
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase())
      );
    });
  }, [purchases, searchTerm]);

  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const currentData = filteredPurchases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", fontWeight: "bold" }}>
        Loading pending purchases...
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem", maxWidth: "100%", overflowX: "auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h1>Pending Payment Verifications</h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "8px 12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              fontSize: "0.9rem",
              width: "220px",
            }}
          />
          <button className="btn-refresh" onClick={load}>
                    <FiRefreshCcw size={18} style={{ marginRight: "6px" }} />
                    Refresh
                  </button>
        </div>
      </div>

      {filteredPurchases.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", fontSize: "1.2rem" }}>
          No purchases found
        </div>
      ) : (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "Arial, sans-serif",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#4F46E5", color: "white" }}>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Offer</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Cards</th>
                <th style={thStyle}>Date & Time</th>
                <th style={thStyle}>Proof</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((p, i) => {
                const localStatus = p.localStatus || "pending";
                const hasScreenshot = Boolean(p.paymentScreenshot);

                return (
                  <tr
                    key={p._id}
                    style={{
                      backgroundColor: i % 2 === 0 ? "#fff" : "#f9f9f9",
                    }}
                  >
                    <td style={tdLeft}>
                      <div style={{ fontWeight: "bold" }}>
                        {p.userId
                          ? `${p.userId.firstName || ""} ${p.userId.lastName || ""}`
                          : "—"}
                      </div>
                      <div style={{ fontSize: "0.9rem" }}>
                        {p.userId?.email || "—"}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#666" }}>
                        {p.userId?.mobile || "—"}
                      </div>
                    </td>

                    <td style={tdCenter}>{p.offerId?.title || "—"}</td>
                    <td style={tdCenter}>₹{p.offerId?.price || "—"}</td>
                    <td style={tdCenter}>{p.totalCards}</td>
                    <td style={tdCenter}>
                      {new Date(p.createdAt).toLocaleDateString("en-IN")}
                      <br />
                      {new Date(p.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td style={tdCenter}>
                      {hasScreenshot ? (
                        <a
                          href={`${API_URL}${p.paymentScreenshot}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={`${API_URL}${p.paymentScreenshot}`}
                            alt="Proof"
                            style={{
                              height: 120,
                              width: 160,
                              objectFit: "cover",
                              borderRadius: 10,
                              border: "1px solid #ccc",
                              cursor: "pointer",
                            }}
                          />
                        </a>
                      ) : (
                        <label
                          style={{
                            backgroundColor: "#2563eb",
                            color: "#fff",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          {uploadingId === p._id ? "Uploading..." : "Upload Proof"}
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) =>
                              handleUpload(p._id, e.target.files?.[0])
                            }
                          />
                        </label>
                      )}
                    </td>

                    <td style={tdCenter}>
                      {localStatus === "pending" && (
                        <>
                          <button
                            onClick={() => approve(p._id)}
                            style={btnApprove}
                            disabled={!hasScreenshot}
                            title={!hasScreenshot ? "Upload proof first" : ""}
                          >
                            Approve
                          </button>
                          <button onClick={() => reject(p._id)} style={btnReject}>
                            Reject
                          </button>
                        </>
                      )}
                      {localStatus === "approved" && (
                        <span style={badgeApproved}>Approved</span>
                      )}
                      {localStatus === "rejected" && (
                        <span style={badgeRejected}>Rejected</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                marginTop: "1.2rem",
              }}
            >
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={paginationBtn}
              >
                Prev
              </button>
              <span style={{ fontWeight: "bold" }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={paginationBtn}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Styles
const thStyle = {
  padding: "12px 8px",
  border: "1px solid #ddd",
  textAlign: "center",
};
const tdCenter = {
  padding: "10px",
  border: "1px solid #ddd",
  textAlign: "center",
  verticalAlign: "middle",
};
const tdLeft = { ...tdCenter, textAlign: "left" };
const btnApprove = {
  backgroundColor: "#22c55e",
  border: "none",
  color: "white",
  fontWeight: "bold",
  padding: "8px 14px",
  borderRadius: "6px",
  marginRight: "8px",
  cursor: "pointer",
  minWidth: "90px",
};
const btnReject = { ...btnApprove, backgroundColor: "#ef4444", marginRight: 0 };
const badgeApproved = {
  display: "inline-block",
  color: "#22c55e",
  fontWeight: "bold",
  padding: "8px 16px",
  borderRadius: "6px",
  border: "2px solid #22c55e",
};
const badgeRejected = {
  ...badgeApproved,
  color: "#ef4444",
  border: "2px solid #ef4444",
};
const paginationBtn = {
  backgroundColor: "#4F46E5",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "6px 12px",
  cursor: "pointer",
};
