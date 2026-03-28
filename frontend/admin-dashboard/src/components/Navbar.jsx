import React from "react";

export default function Navbar({ title = "Dashboard", profileName = "Admin User", onLogout, onToggleSidebar }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Mobile menu toggle button, visible on mobile only */}
        <button className="mobile-menu-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          &#9776; {/* Hamburger icon */}
        </button>
        <h2 className="topbar-title">{title}</h2>
      </div>

      <div className="topbar-right">
        <button className="btn-logout" onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
}
