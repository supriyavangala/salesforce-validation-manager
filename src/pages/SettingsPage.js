import React from "react";

export default function SettingsPage() {
  const clientId = process.env.REACT_APP_SF_CLIENT_ID || "Not configured";
  const callbackUrl = process.env.REACT_APP_SF_CALLBACK_URL || "Not configured";
  const loginUrl = process.env.REACT_APP_SF_LOGIN_URL || "Not configured";

  const card = {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    maxWidth: "600px",
    marginTop: "16px",
  };
  const label = { color: "#555", marginBottom: "4px" };
  const value = {
    color: "#007bff",
    fontFamily: "monospace",
    wordBreak: "break-all",
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>App Settings</h2>
      <p style={{ color: "#555" }}>
        Read from your <code>.env</code> file. Restart the app after changes.
      </p>
      <div style={card}>
        <p style={label}>
          <strong>Consumer Key (Client ID)</strong>
        </p>
        <p style={value}>{clientId}</p>
        <p style={{ ...label, marginTop: "16px" }}>
          <strong>OAuth Callback URL</strong>
        </p>
        <p style={value}>{callbackUrl}</p>
        <p style={{ ...label, marginTop: "16px" }}>
          <strong>Salesforce Login URL</strong>
        </p>
        <p style={value}>{loginUrl}</p>
      </div>
    </div>
  );
}
