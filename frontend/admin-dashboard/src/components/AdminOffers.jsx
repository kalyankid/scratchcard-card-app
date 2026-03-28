import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState({ title: "", role: "retailer", price: 0, cards: 0 });
  const [showPopup, setShowPopup] = useState(false); // for popup visibility
  const [isEditing, setIsEditing] = useState(false); // to check add/update mode

  const BASE_URL = import.meta.env.VITE_API_URL;

  const fetchOffers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/offers`);
      setOffers(res.data);
    } catch (err) {
      console.error("Failed to fetch offers:", err);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleSubmit = async () => {
    try {
      if (form._id) {
        await axios.put(`${BASE_URL}/api/offers/${form._id}`, form);
      } else {
        await axios.post(`${BASE_URL}/api/offers`, form);
      }
      setForm({ title: "", role: "retailer", price: 0, cards: 0 });
      setShowPopup(false);
      setIsEditing(false);
      fetchOffers();
    } catch (err) {
      console.error("Failed to save offer:", err);
    }
  };

  const handleEdit = (offer) => {
    setForm(offer);
    setIsEditing(true);
    setShowPopup(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/offers/${id}`);
      fetchOffers();
    } catch (err) {
      console.error("Failed to delete offer:", err);
    }
  };

  const openAddPopup = () => {
    setForm({ title: "", role: "retailer", price: 0, cards: 0 });
    setIsEditing(false);
    setShowPopup(true);
  };

  // Group offers by role
  const roles = ["retailer", "distributor", "master_distributor"];
  const groupedOffers = {};
  roles.forEach((role) => {
    groupedOffers[role] = offers.filter((o) => o.role === role);
  });

  return (
    <div style={{ padding: 30, fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Manage Offers</h2>

      {/* Add Offer Button */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button
          onClick={openAddPopup}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6C63FF",
            color: "#fff",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          + Add Offer
        </button>
      </div>

      {/* Offers Section */}
      {roles.map((role) => (
        <div key={role} style={{ marginBottom: 30 }}>
          <h3
            style={{
              textTransform: "capitalize",
              borderBottom: "2px solid #6C63FF",
              paddingBottom: 5,
            }}
          >
            {role.replace("_", " ")} Offers
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 15, marginTop: 10 }}>
            {groupedOffers[role].length === 0 && <p style={{ color: "#888" }}>No offers yet</p>}
            {groupedOffers[role].map((offer) => (
              <div
                key={offer._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 15,
                  width: 180,
                  textAlign: "center",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <h4 style={{ margin: "5px 0" }}>{offer.title}</h4>
                <p style={{ margin: "5px 0" }}>₹{offer.price}</p>
                <p style={{ margin: "5px 0" }}>{offer.cards} Cards</p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 5,
                    marginTop: 10,
                  }}
                >
                  <button
                    onClick={() => handleEdit(offer)}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#FFA500",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      color: "#fff",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(offer._id)}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#FF4C4C",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      color: "#fff",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Popup Modal */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: 30,
              borderRadius: 10,
              width: "90%",
              maxWidth: 400,
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ textAlign: "center", marginBottom: 20 }}>
              {isEditing ? "Update Offer" : "Add Offer"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={{
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 15,
                }}
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={{
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 15,
                }}
              >
                <option value="retailer">Retailer</option>
                <option value="distributor">Distributor</option>
                <option value="master_distributor">Master Distributor</option>
              </select>
              <input
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                style={{
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 15,
                }}
              />
              <input
                type="number"
                placeholder="Cards"
                value={form.cards}
                onChange={(e) => setForm({ ...form, cards: Number(e.target.value) })}
                style={{
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 15,
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 20,
                }}
              >
                <button
                  onClick={() => {
                    setShowPopup(false);
                    setIsEditing(false);
                  }}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#ccc",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#6C63FF",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  {isEditing ? "Update Offer" : "Add Offer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
