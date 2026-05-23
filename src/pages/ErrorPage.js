import React from "react";
import { Link } from "react-router-dom";

export default function ErrorPage() {
  return (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <h2>404 - Page Not Found</h2>
      <p>Oops! The page you're looking for doesn't exist.</p>
      <Link to="/">
        <button>Return to Home</button>
      </Link>
    </div>
  );
}
