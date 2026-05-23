const BACKEND_URL = "http://localhost:4000";

function getHeaders() {
  const token = localStorage.getItem("sf_access_token");
  const instanceUrl = localStorage.getItem("sf_instance_url");

  // Debug — open F12 Console to see these values
  console.log("Token exists:", !!token);
  console.log(
    "Token preview:",
    token ? token.substring(0, 30) + "..." : "MISSING",
  );
  console.log("Instance URL:", instanceUrl || "MISSING");

  if (!token || !instanceUrl) {
    console.error("❌ Missing token or instanceUrl in localStorage!");
  }

  return {
    Authorization: `Bearer ${token}`,
    "sf-instance-url": instanceUrl,
    "Content-Type": "application/json",
  };
}

export function isLoggedIn() {
  return !!localStorage.getItem("sf_access_token");
}

export function clearSession() {
  localStorage.removeItem("sf_access_token");
  localStorage.removeItem("sf_instance_url");
}

export async function getValidationRules() {
  const headers = getHeaders();
  console.log("Calling /api/validation-rules with headers:", headers);

  const res = await fetch(`${BACKEND_URL}/api/validation-rules`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch rules");
  return data;
}

export async function getRuleById(id) {
  const res = await fetch(`${BACKEND_URL}/api/validation-rules/${id}`, {
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch rule");
  return data;
}

export async function toggleRule(id, active) {
  const res = await fetch(`${BACKEND_URL}/api/validation-rules/${id}/toggle`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ active }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to toggle rule");
  return data;
}

export async function deployValidationRules(rules) {
  const res = await fetch(`${BACKEND_URL}/api/deploy-validation-rules`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(rules),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to deploy rules");
  return data;
}
