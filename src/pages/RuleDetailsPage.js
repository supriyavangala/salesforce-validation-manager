import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRuleById } from "../services/salesforceApi";

export default function RuleDetailsPage() {
  const { id } = useParams();
  const [rule, setRule] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRule() {
      try {
        const data = await getRuleById(id);
        setRule(data);
      } catch (err) {
        setError("Failed to load rule details.");
      }
    }
    fetchRule();
  }, [id]);

  if (error)
    return (
      <p className="error" style={{ padding: "20px" }}>
        {error}
      </p>
    );
  if (!rule) return <p style={{ padding: "20px" }}>Loading rule details...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h2>{rule.ValidationName}</h2>
      <p>
        <strong>Status:</strong> {rule.Active ? "Active ✅" : "Inactive ❌"}
      </p>
      <p>
        <strong>Error Message:</strong> {rule.ErrorMessage}
      </p>
      <p>
        <strong>Formula:</strong> <code>{rule.ErrorConditionFormula}</code>
      </p>
      <Link to="/dashboard">⬅ Back to Dashboard</Link>
    </div>
  );
}
