// src/pages/Dashboard.jsx
import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarVisible, setSidebarVisible] = useState(false);

  const items = [
    {
      key: "user-management",
      title: "User Management",
      children: [
        { key: "registered-users", title: "Registered Users" },
        { key: "approved-users", title: "Approved Users" },
        { key: "rejected-users", title: "Rejected Users" },
        { key: "pending-users", title: "Pending Users" },
      ],
    },
    { key: "users-purchases", title: "Users Purchases" },
    { key: "pending-purchases", title: "Pending Purchases" },
    { key: "offers", title: "Offers" },
    { key: "analytics", title: "Analytics" },
    { key: "settings", title: "Settings" },
  ];

  const toggleSidebar = () => setSidebarVisible((v) => !v);
  const closeSidebar = () => setSidebarVisible(false);

  return (
    <div className={`app-root ${sidebarVisible ? "sidebar-open" : ""}`}>
      <Sidebar
        items={items}
        active={location.pathname.split("/").pop()} // highlight current page
        onSelect={(key) => {
          navigate(`/dashboard/${key}`);
          closeSidebar();
        }}
        visible={sidebarVisible}
        onClose={closeSidebar}
      />
      <div className="main">
        <Navbar
          title="Admin Dashboard"
          profileName="Admin"
          onLogout={onLogout}
          onToggleSidebar={toggleSidebar}
        />
        <div className="content">
          <Outlet /> {/* renders nested route component */}
        </div>
      </div>
    </div>
  );
}
