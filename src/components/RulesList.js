import React from "react";
import { Link } from "react-router-dom";

export default function RulesList({ rules, onToggle }) {
  if (!rules || rules.length === 0) {
    return <p>No validation rules found.</p>;
  }

  return (
    <ul>
      {rules.map((rule) => (
        <li key={rule.Id}>
          <Link to={`/rules/${rule.Id}`}>
            <strong>{rule.ValidationName}</strong>
          </Link>{" "}
          — {rule.Active ? "✅ Active" : "❌ Inactive"}
          <button onClick={() => onToggle(rule.Id, !rule.Active)}>
            Toggle
          </button>
        </li>
      ))}
    </ul>
  );
}
