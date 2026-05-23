import React, { useEffect, useState, useCallback } from "react";
import {
  getValidationRules,
  deployValidationRules,
} from "../services/salesforceApi";

const thStyle = {
  border: "1px solid #dee2e6",
  padding: "10px 14px",
  backgroundColor: "#007bff",
  color: "white",
  textAlign: "left",
};
const tdStyle = { border: "1px solid #dee2e6", padding: "10px 14px" };

export default function DeployPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getValidationRules();
      setRules(data.records || []);
    } catch (err) {
      setError("Failed to load rules. Please check your login session.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  async function handleDeployAll() {
    const payload = rules.map((r) => ({ id: r.Id, active: r.Active }));
    if (payload.length === 0) {
      setSuccessMsg("No rules to deploy.");
      return;
    }

    try {
      setDeploying(true);
      setError("");
      setSuccessMsg("");
      const result = await deployValidationRules(payload);
      if (result.errors && result.errors.length > 0) {
        setError(
          "Some rules failed: " + result.errors.map((e) => e.error).join(", "),
        );
      } else {
        setSuccessMsg(
          `✅ All ${payload.length} rule(s) deployed successfully!`,
        );
      }
    } catch (err) {
      setError("Deployment failed: " + err.message);
    } finally {
      setDeploying(false);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Deploy Validation Rules</h2>
      <p style={{ color: "#555" }}>
        Deploy all Account validation rules to Salesforce in their current
        state. Use the <strong>Dashboard</strong> to toggle rules before
        deploying.
      </p>

      {error && <p className="error">{error}</p>}
      {successMsg && (
        <p style={{ color: "green", fontWeight: "bold" }}>{successMsg}</p>
      )}

      <div style={{ margin: "16px 0" }}>
        <button onClick={fetchRules} style={{ marginRight: "10px" }}>
          🔄 Refresh
        </button>
        <button
          onClick={handleDeployAll}
          disabled={deploying || loading || rules.length === 0}
          style={{
            backgroundColor: "#28a745",
            opacity: deploying || loading || rules.length === 0 ? 0.6 : 1,
          }}
        >
          {deploying ? "Deploying…" : `🚀 Deploy All (${rules.length}) Rules`}
        </button>
      </div>

      {loading ? (
        <p>Loading rules…</p>
      ) : rules.length === 0 ? (
        <p>No validation rules found for the Account object.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Rule Name</th>
              <th style={thStyle}>Error Message</th>
              <th style={thStyle}>Current Status</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.Id}>
                <td style={tdStyle}>
                  <strong>{rule.ValidationName}</strong>
                </td>
                <td style={tdStyle}>{rule.ErrorMessage}</td>
                <td style={tdStyle}>
                  {rule.Active ? "Active ✅" : "Inactive ❌"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
