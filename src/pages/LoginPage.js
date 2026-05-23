import React from "react";
import { useNavigate } from "react-router-dom";
import LoginButton from "../components/LoginButton";
import { isLoggedIn } from "../services/salesforceApi";

export default function LoginPage() {
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  if (isLoggedIn()) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <h2>Login to Salesforce</h2>
      <p style={{ color: "#555", marginBottom: "24px" }}>
        Click below to authenticate with your Salesforce Developer Org via OAuth
        2.0.
      </p>
      <LoginButton />
    </div>
  );
}
