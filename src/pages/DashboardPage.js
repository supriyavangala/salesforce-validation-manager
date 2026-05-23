import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getValidationRules,
  deployValidationRules,
} from "../services/salesforceApi";

const thStyle = {
  border: "1px solid #dee2e6",
  padding: "10px 14px",
  textAlign: "left",
  backgroundColor: "#007bff",
  color: "white",
};
const tdStyle = { border: "1px solid #dee2e6", padding: "10px 14px" };

export default function DashboardPage() {
  const [rules, setRules] = useState([]);
  const [pendingChanges, setPendingChanges] = useState({});
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSuccessMsg("");
      const data = await getValidationRules();
      setRules(data.records || []);
      setPendingChanges({});
    } catch (err) {
      setError(
        "Failed to load validation rules. Please check your login session.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  function effectiveActive(rule) {
    return rule.Id in pendingChanges ? pendingChanges[rule.Id] : rule.Active;
  }

  function handleToggle(ruleId, currentEffective) {
    setSuccessMsg("");
    setPendingChanges((prev) => ({ ...prev, [ruleId]: !currentEffective }));
  }

  function handleEnableAll() {
    setSuccessMsg("");
    const all = {};
    rules.forEach((r) => {
      all[r.Id] = true;
    });
    setPendingChanges(all);
  }

  function handleDisableAll() {
    setSuccessMsg("");
    const all = {};
    rules.forEach((r) => {
      all[r.Id] = false;
    });
    setPendingChanges(all);
  }

  async function handleDeploy() {
    const payload = Object.entries(pendingChanges).map(([id, active]) => ({
      id,
      active,
    }));
    if (payload.length === 0) {
      setSuccessMsg("No pending changes to deploy.");
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
          `✅ ${payload.length} rule(s) deployed to Salesforce successfully!`,
        );
        await fetchRules();
      }
    } catch (err) {
      setError("Deploy failed: " + err.message);
    } finally {
      setDeploying(false);
    }
  }

  if (loading)
    return <p style={{ padding: "20px" }}>Loading validation rules...</p>;

  const pendingCount = Object.keys(pendingChanges).length;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Validation Rules Dashboard</h2>

      {error && <p className="error">{error}</p>}
      {successMsg && (
        <p style={{ color: "green", fontWeight: "bold" }}>{successMsg}</p>
      )}

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        <button onClick={fetchRules}>🔄 Refresh</button>
        <button onClick={handleEnableAll}>✅ Enable All</button>
        <button className="danger" onClick={handleDisableAll}>
          ❌ Disable All
        </button>
        <button
          onClick={handleDeploy}
          disabled={deploying}
          style={{
            backgroundColor: pendingCount > 0 ? "#28a745" : "#6c757d",
            opacity: deploying ? 0.7 : 1,
          }}
        >
          {deploying
            ? "Deploying…"
            : `🚀 Deploy Changes${pendingCount > 0 ? ` (${pendingCount})` : ""}`}
        </button>
      </div>

      {pendingCount > 0 && (
        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "4px",
            padding: "8px 14px",
            marginBottom: "14px",
            color: "#856404",
          }}
        >
          ⚠️ <strong>{pendingCount}</strong> unsaved change(s). Click{" "}
          <strong>Deploy Changes</strong> to save to Salesforce.
        </div>
      )}

      {rules.length === 0 ? (
        <p>No validation rules found for the Account object.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Rule Name</th>
              <th style={thStyle}>Current (in Salesforce)</th>
              <th style={thStyle}>After Deploy</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => {
              const effective = effectiveActive(rule);
              const hasPending = rule.Id in pendingChanges;
              return (
                <tr
                  key={rule.Id}
                  style={{ backgroundColor: hasPending ? "#fffbe6" : "white" }}
                >
                  <td style={tdStyle}>
                    <Link to={`/rules/${rule.Id}`}>{rule.ValidationName}</Link>
                    {hasPending && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 11,
                          color: "#856404",
                          background: "#fff3cd",
                          padding: "2px 6px",
                          borderRadius: 4,
                        }}
                      >
                        pending
                      </span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {rule.Active ? "Active ✅" : "Inactive ❌"}
                  </td>
                  <td style={tdStyle}>
                    {effective ? "Active ✅" : "Inactive ❌"}
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => handleToggle(rule.Id, effective)}>
                      {effective ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
