import React, { useState } from "react";
import { IoChevronDown, IoChevronForward } from "react-icons/io5";

export default function Sidebar({ items = [], onSelect, active, visible, onClose }) {
  const [openKeys, setOpenKeys] = useState([]);

  const toggleOpen = (key) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Sidebar CSS classes: visible controls mobile show/hide
  const sidebarClass = `sidebar ${visible ? "sidebar-visible" : "sidebar-hidden"}`;

  return (
    <aside className={sidebarClass}>
      <div className="sidebar-header">
        {/* Close button for mobile */}
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">×</button>
      </div>

      <div className="brand">
        <div className="logo-circle">AD</div>
        <div className="brand-text">Admin</div>
      </div>

      <nav className="nav-list">
        {items.map((it) => {
          const hasChildren = it.children && it.children.length > 0;
          const isOpen = openKeys.includes(it.key);

          return (
            <div key={it.key} className="nav-group">
              <button
                className={`nav-item ${active === it.key ? "active" : ""}`}
                onClick={() => (hasChildren ? toggleOpen(it.key) : onSelect(it.key))}
              >
                <span className="nav-text">{it.title}</span>
                {hasChildren && (
                  <span className="arrow">
                    {isOpen ? <IoChevronDown /> : <IoChevronForward />}
                  </span>
                )}
              </button>

              {hasChildren && isOpen && (
                <div className="sub-list">
                  {it.children.map((child) => (
                    <button
                      key={child.key}
                      className={`sub-item ${active === child.key ? "active" : ""}`}
                      onClick={() => onSelect(child.key)}
                    >
                      {child.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <small>@ {new Date().getFullYear()}</small>
      </div>
    </aside>
  );
}
