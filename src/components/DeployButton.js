import React from "react";

export default function DeployButton({ rules, onDeploy }) {
  return <button onClick={() => onDeploy(rules)}>Deploy Changes</button>;
}
