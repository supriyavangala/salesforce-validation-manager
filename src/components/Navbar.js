import React from "react";
import { Link } from "react-router-dom";
import { isLoggedIn, clearSession } from "../services/salesforceApi";
import "./Navbar.css";

export default function Navbar() {
  const loggedIn = isLoggedIn();

  function handleLogout() {
    clearSession();
    window.location.href = "/";
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">Salesforce Manager</div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        {!loggedIn && <Link to="/login">Login</Link>}
        {loggedIn && <Link to="/dashboard">Dashboard</Link>}
        {loggedIn && <Link to="/deploy">Deploy</Link>}
        {loggedIn && <Link to="/settings">Settings</Link>}
      </div>
      {loggedIn && (
        <button
          className="danger"
          onClick={handleLogout}
          style={{ marginLeft: "16px", padding: "6px 14px" }}
        >
          Logout
        </button>
      )}
    </nav>
  );
}
