import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CallbackPage() {
  const navigate = useNavigate();
  const [debugInfo, setDebugInfo] = useState({});
  const [status, setStatus] = useState("Reading Salesforce response...");

  useEffect(() => {
    // Log everything so we can see what Salesforce sent back
    const fullUrl = window.location.href;
    const hash = window.location.hash;
    const search = window.location.search;
    const rawHash = hash.substring(1);

    console.log("=== CALLBACK DEBUG ===");
    console.log("Full URL:", fullUrl);
    console.log("Hash:", hash);
    console.log("Search:", search);
    console.log("Raw hash content:", rawHash);

    // Show debug info on screen
    setDebugInfo({ fullUrl, hash, search, rawHash });

    // ── Try reading from HASH (implicit flow: response_type=token) ────────────
    if (rawHash) {
      const hashParams = new URLSearchParams(rawHash);
      const accessToken = hashParams.get("access_token");
      const instanceUrl = hashParams.get("instance_url");
      const error = hashParams.get("error");
      const errorDesc = hashParams.get("error_description");

      console.log(
        "access_token from hash:",
        accessToken ? "FOUND ✅" : "NOT FOUND ❌",
      );
      console.log("instance_url from hash:", instanceUrl);
      console.log("error:", error);

      if (error) {
        setStatus(`❌ Salesforce error: ${errorDesc || error}`);
        return;
      }

      if (accessToken && instanceUrl) {
        const decodedUrl = decodeURIComponent(instanceUrl);
        localStorage.setItem("sf_access_token", accessToken);
        localStorage.setItem("sf_instance_url", decodedUrl);
        console.log("✅ Tokens saved to localStorage");
        console.log("instance_url saved:", decodedUrl);
        setStatus("✅ Login successful! Redirecting to dashboard...");
        setTimeout(() => navigate("/dashboard"), 1000);
        return;
      }
    }

    // ── Try reading from QUERY PARAMS (code flow: response_type=code) ─────────
    if (search) {
      const searchParams = new URLSearchParams(search);
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const errorDesc = searchParams.get("error_description");

      console.log("code from query:", code ? "FOUND" : "NOT FOUND");
      console.log("error from query:", error);

      if (error) {
        setStatus(`❌ Salesforce error: ${errorDesc || error}`);
        return;
      }

      if (code) {
        setStatus(
          "⚠️ Got authorization code but app uses implicit flow. Check LoginButton response_type.",
        );
        return;
      }
    }

    // ── Already logged in ──────────────────────────────────────────────────────
    const existingToken = localStorage.getItem("sf_access_token");
    if (existingToken) {
      setStatus("✅ Already logged in, redirecting...");
      setTimeout(() => navigate("/dashboard"), 500);
      return;
    }

    // ── Nothing worked ─────────────────────────────────────────────────────────
    setStatus("❌ No tokens found in URL. See debug info below.");
  }, [navigate]);

  const isError = status.startsWith("❌");
  const isWarning = status.startsWith("⚠️");
  const isSuccess = status.startsWith("✅");

  return (
    <div style={{ padding: "30px 20px", maxWidth: "700px", margin: "0 auto" }}>
      <h2>Salesforce OAuth Callback</h2>

      {/* Status message */}
      <p
        style={{
          padding: "12px 16px",
          borderRadius: "6px",
          fontWeight: "bold",
          fontSize: "15px",
          backgroundColor: isError
            ? "#f8d7da"
            : isWarning
              ? "#fff3cd"
              : isSuccess
                ? "#d4edda"
                : "#cce5ff",
          color: isError
            ? "#721c24"
            : isWarning
              ? "#856404"
              : isSuccess
                ? "#155724"
                : "#004085",
          border: `1px solid ${
            isError
              ? "#f5c6cb"
              : isWarning
                ? "#ffc107"
                : isSuccess
                  ? "#c3e6cb"
                  : "#b8daff"
          }`,
        }}
      >
        {status}
      </p>

      {/* Debug info — shows what Salesforce sent back */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "6px",
          padding: "16px",
          marginTop: "16px",
        }}
      >
        <strong>🔍 Debug Info (open F12 Console for more detail)</strong>
        <table
          style={{
            width: "100%",
            marginTop: "10px",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}
        >
          <tbody>
            {Object.entries(debugInfo).map(([key, val]) => (
              <tr key={key} style={{ borderBottom: "1px solid #dee2e6" }}>
                <td
                  style={{
                    padding: "6px 10px",
                    fontWeight: "bold",
                    width: "140px",
                    color: "#555",
                  }}
                >
                  {key}
                </td>
                <td
                  style={{
                    padding: "6px 10px",
                    wordBreak: "break-all",
                    fontFamily: "monospace",
                    fontSize: "12px",
                  }}
                >
                  {val || <span style={{ color: "#aaa" }}>empty</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* localStorage current state */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "6px",
          padding: "16px",
          marginTop: "12px",
        }}
      >
        <strong>💾 localStorage state</strong>
        <table
          style={{
            width: "100%",
            marginTop: "10px",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}
        >
          <tbody>
            <tr style={{ borderBottom: "1px solid #dee2e6" }}>
              <td
                style={{
                  padding: "6px 10px",
                  fontWeight: "bold",
                  width: "180px",
                }}
              >
                sf_access_token
              </td>
              <td
                style={{
                  padding: "6px 10px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                }}
              >
                {localStorage.getItem("sf_access_token") ? (
                  <span style={{ color: "green" }}>
                    ✅ Present (
                    {localStorage.getItem("sf_access_token").substring(0, 20)}
                    ...)
                  </span>
                ) : (
                  <span style={{ color: "red" }}>❌ Missing</span>
                )}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "6px 10px", fontWeight: "bold" }}>
                sf_instance_url
              </td>
              <td
                style={{
                  padding: "6px 10px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                }}
              >
                {localStorage.getItem("sf_instance_url") ? (
                  <span style={{ color: "green" }}>
                    ✅ {localStorage.getItem("sf_instance_url")}
                  </span>
                ) : (
                  <span style={{ color: "red" }}>❌ Missing</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button onClick={() => navigate("/login")}>← Back to Login</button>
        {isSuccess && (
          <button
            onClick={() => navigate("/dashboard")}
            style={{ backgroundColor: "#28a745" }}
          >
            Go to Dashboard →
          </button>
        )}
      </div>
    </div>
  );
}
