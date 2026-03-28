// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import UsersTable from "./components/UsersTable";
import ApprovedUsers from "./components/ApprovedUsers";
import RejectedUsers from "./components/RejectedUsers";
import PendingUsers from "./components/PendingUsers";
import UsersPurchases from "./components/UsersPurchases";
import AdminOffers from "./components/AdminOffers";
import PendingPurchases from "./components/PendingPurchases";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("isLoggedIn");
    if (saved === "true") setIsLoggedIn(true);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <Router>
      <Routes>
        {/* Redirect root (/) appropriately */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard/registered-users" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ✅ LOGIN PAGE ROUTE */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard/registered-users" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        {/* ✅ DASHBOARD ROUTES */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <Dashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="registered-users" element={<UsersTable />} />
          <Route path="approved-users" element={<ApprovedUsers />} />
          <Route path="rejected-users" element={<RejectedUsers />} />
          <Route path="pending-users" element={<PendingUsers />} />
          <Route path="users-purchases" element={<UsersPurchases />} />
          <Route path="pending-purchases" element={<PendingPurchases />} />
          <Route path="offers" element={<AdminOffers />} />
          <Route path="analytics" element={<div className="card">Analytics (TBD)</div>} />
          <Route path="settings" element={<div className="card">Settings (TBD)</div>} />
        </Route>

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
