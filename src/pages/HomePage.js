import React from "react";
import { Link } from "react-router-dom";
import { isLoggedIn } from "../services/salesforceApi";

export default function HomePage() {
  const loggedIn = isLoggedIn();

  return (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <h1 style={{ color: "#007bff" }}>Salesforce Validation Rules Manager</h1>
      <p
        style={{
          color: "#555",
          fontSize: "16px",
          maxWidth: "560px",
          margin: "12px auto 32px",
        }}
      >
        View, toggle, and deploy Account validation rules directly from your
        browser — powered by the Tooling API and OAuth 2.0.
      </p>
      {loggedIn ? (
        <Link to="/dashboard">
          <button style={{ fontSize: "15px", padding: "10px 28px" }}>
            Go to Dashboard →
          </button>
        </Link>
      ) : (
        <Link to="/login">
          <button style={{ fontSize: "15px", padding: "10px 28px" }}>
            Login with Salesforce
          </button>
        </Link>
      )}
    </div>
  );
}
