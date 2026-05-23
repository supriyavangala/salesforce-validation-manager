import React, { useState } from "react";

export default function LoginButton() {
  const [debugInfo, setDebugInfo] = useState("");

  const loginWithSalesforce = () => {
    const clientId = process.env.REACT_APP_SF_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_SF_CALLBACK_URL;
    const baseUrl =
      process.env.REACT_APP_SF_LOGIN_URL || "https://login.salesforce.com";

    setDebugInfo(
      `Client ID: ${clientId ? clientId.substring(0, 20) + "..." : "❌ MISSING"} | ` +
        `Redirect: ${redirectUri || "❌ MISSING"}`,
    );

    if (!clientId) {
      alert("❌ REACT_APP_SF_CLIENT_ID missing in .env");
      return;
    }
    if (!redirectUri) {
      alert("❌ REACT_APP_SF_CALLBACK_URL missing in .env");
      return;
    }

    // NO scope parameter — Salesforce uses whatever scopes
    // are configured in the Connected App settings
    const authUrl =
      `${baseUrl}/services/oauth2/authorize` +
      `?response_type=token` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;

    console.log("Redirecting to Salesforce:", authUrl);
    window.location.href = authUrl;
  };

  return (
    <div style={{ textAlign: "center" }}>
      <button
        onClick={loginWithSalesforce}
        style={{ fontSize: "16px", padding: "12px 30px", marginBottom: "12px" }}
      >
        🔐 Login with Salesforce
      </button>
      {debugInfo && (
        <p style={{ fontSize: "12px", color: "#555", fontFamily: "monospace" }}>
          {debugInfo}
        </p>
      )}
    </div>
  );
}
