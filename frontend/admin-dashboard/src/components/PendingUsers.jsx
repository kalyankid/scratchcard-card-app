import React, { useEffect, useState } from "react";
import { fetchPendingUsers } from "../api";

export default function PendingUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchPendingUsers();
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch pending users", err);
      }
    };
    load();
  }, []);

  return (
    <div className="table-card">
      <h3>Pending Users</h3>
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr><td colSpan={4} style={{ textAlign: "center" }}>No pending users</td></tr>
          )}
          {users.map((u) => (
            <tr key={u._id}>
            <td>{u.firstName} {u.lastName}</td>
              <td>{u.email}</td>
              <td>{u.mobile}</td>
              <td>{u.role ?? "-"}</td>
              <td className={`status ${u.status}`}>{u.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
