// components/UsersPurchases.jsx
import React, { useEffect, useState } from "react";
import { fetchUsersWithPurchases } from "../api";
import "./UsersPurchases.css";

export default function UsersPurchases() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPurchases, setSelectedPurchases] = useState(null);
  const [selectedGifts, setSelectedGifts] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchUsersWithPurchases();
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users purchases", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="card loading-card">Loading...</div>;
  }

  if (users.length === 0) {
    return <div className="card empty-card"><p>No users found</p></div>;
  }

  return (
    <div className="users-table-container">
      <h2>Users</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.mobile}</td>
              <td>{user.role}</td>
              <td>
                <button
                  className="action-btn purchases-btn"
                  onClick={() => setSelectedPurchases(user)}
                >
                  Purchases
                </button>
                <button
                  className="action-btn gifts-btn"
                  onClick={() => setSelectedGifts(user)}
                >
                  Gifts Assigned
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Purchases Modal */}
      {selectedPurchases && (
        <div className="modal-overlay" onClick={() => setSelectedPurchases(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Purchases of {selectedPurchases.name}</h3>
            <table className="modal-table">
              <thead>
                <tr>
                  <th>Offer</th>
                  <th>Price</th>
                  <th>Cards</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {selectedPurchases.purchases.length > 0 ? (
                  selectedPurchases.purchases.map((p) => (
                    <tr key={p._id}>
                      <td>{p.offer}</td>
                      <td>₹{p.price ?? "N/A"}</td>
                      <td>{p.cards}</td>
                      <td>{new Date(p.date).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="empty-text">No purchases</td>
                  </tr>
                )}
              </tbody>
            </table>
            <button className="close-btn" onClick={() => setSelectedPurchases(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Gifts Modal */}
      {selectedGifts && (
        <div className="modal-overlay" onClick={() => setSelectedGifts(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Gifts Assigned to {selectedGifts.name}</h3>
            <table className="modal-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Assigned Cards</th>
                  <th>Gifts</th>
                </tr>
              </thead>
              <tbody>
                {selectedGifts.gifts.length > 0 ? (
                  selectedGifts.gifts.map((g) => (
                    <tr key={g._id}>
                      <td>{new Date(g.date).toLocaleDateString()}</td>
                      <td>{g.assignedCount}</td>
                      <td>
                        <ul className="gift-items-list">
                          {g.gifts.map((gift, idx) => (
                            <li key={idx}>
                              {gift.name} × {gift.quantity}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="empty-text">No gifts assigned</td>
                  </tr>
                )}
              </tbody>
            </table>
            <button className="close-btn" onClick={() => setSelectedGifts(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
