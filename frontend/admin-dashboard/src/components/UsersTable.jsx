// src/components/UsersTable.jsx
import React, { useEffect, useState } from "react";
import {
  fetchUsers,
  approveUser,
  rejectUser,
  assignRole,
} from "../api";
import { FiRefreshCcw } from "react-icons/fi"; // refresh icon

const ROLE_OPTIONS = [
  { value: "retailer", label: "Retailer" },
  { value: "distributor", label: "Distributor" },
  { value: "master_distributor", label: "Master Distributor" },
];

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingIds, setUpdatingIds] = useState({}); // track per-row updates

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
      alert("Failed to fetch users. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setUpdating = (id, flag) =>
    setUpdatingIds((s) => ({ ...s, [id]: flag }));

  const handleApprove = async (id) => {
    try {
      setUpdating(id, true);
      const res = await approveUser(id);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? res.data : u))
      );
    } catch (err) {
      console.error(err);
      alert("Approve failed");
    } finally {
      setUpdating(id, false);
    }
  };

  const handleReject = async (id) => {
    try {
      setUpdating(id, true);
      const res = await rejectUser(id);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? res.data : u))
      );
    } catch (err) {
      console.error(err);
      alert("Reject failed");
    } finally {
      setUpdating(id, false);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      setUpdating(id, true);
      const res = await assignRole(id, role);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? res.data : u))
      );
    } catch (err) {
      console.error(err);
      alert("Role update failed");
    } finally {
      setUpdating(id, false);
    }
  };

  if (loading) return <div className="card">Loading users…</div>;

  return (
    <div className="table-card">
      {/* Header with Refresh button */}
      <div className="table-header">
        <h3>Registered Users</h3>
        <button className="btn-refresh" onClick={load}>
          <FiRefreshCcw size={18} style={{ marginRight: "6px" }} />
          Refresh
        </button>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Role</th>
            <th>Status</th>
            <th>Assign Role</th>
            <th>Permission</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                No users found
              </td>
            </tr>
          )}
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.firstName} {u.lastName}</td>
              <td>{u.email}</td>
              <td>{u.mobile}</td>
              <td>{u.role ?? "-"}</td>
              <td className={`status ${u.status}`}>{u.status}</td>
              <td>
                <select
                  value={u.role ?? ""}
                  onChange={(e) => handleRoleChange(u._id, e.target.value)}
                  disabled={!!updatingIds[u._id]}
                >
                  <option value="">— select —</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    className="btn btn-approve"
                    onClick={() => handleApprove(u._id)}
                    disabled={u.status === "approved" || !!updatingIds[u._id]}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-reject"
                    onClick={() => handleReject(u._id)}
                    disabled={u.status === "rejected" || !!updatingIds[u._id]}
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
