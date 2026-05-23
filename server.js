require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
const SF_CALLBACK_URL =
  process.env.SF_CALLBACK_URL || "http://localhost:3000/callback";
const SF_LOGIN_URL = process.env.SF_LOGIN_URL || "https://login.salesforce.com";

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// ── POST /api/oauth/token ─────────────────────────────────────────────────────
app.post("/api/oauth/token", async (req, res) => {
  const { code } = req.body;
  if (!code)
    return res.status(400).json({ error: "Missing authorization code" });

  try {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: SF_CLIENT_ID,
      client_secret: SF_CLIENT_SECRET,
      redirect_uri: SF_CALLBACK_URL,
      code,
    });

    const response = await fetch(`${SF_LOGIN_URL}/services/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await response.json();
    console.log("OAuth token response status:", response.status);
    console.log("OAuth token response:", JSON.stringify(data));

    if (!response.ok) {
      return res
        .status(400)
        .json({ error: data.error_description || "OAuth failed" });
    }
    res.json({
      access_token: data.access_token,
      instance_url: data.instance_url,
    });
  } catch (err) {
    console.error("OAuth error:", err);
    res.status(500).json({ error: "OAuth token exchange failed" });
  }
});

// ── GET /api/validation-rules ─────────────────────────────────────────────────
app.get("/api/validation-rules", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const instanceUrl = req.headers["sf-instance-url"];

    console.log("=== GET /api/validation-rules ===");
    console.log(
      "Token received:",
      token ? token.substring(0, 30) + "..." : "MISSING",
    );
    console.log("Instance URL received:", instanceUrl || "MISSING");

    if (!token || !instanceUrl) {
      return res.status(400).json({ error: "Missing token or instance URL" });
    }

    const query =
      "SELECT Id, ValidationName, Active, ErrorMessage " +
      "FROM ValidationRule WHERE EntityDefinition.QualifiedApiName = 'Account'";

    const sfUrl = `${instanceUrl}/services/data/v61.0/tooling/query/?q=${encodeURIComponent(query)}`;
    console.log("Calling Salesforce URL:", sfUrl);

    const response = await fetch(sfUrl, { headers: authHeaders(token) });
    const data = await response.json();

    console.log("Salesforce response status:", response.status);
    console.log("Salesforce response body:", JSON.stringify(data));

    if (!response.ok) {
      return res.status(response.status).json({
        error: data[0]?.message || JSON.stringify(data),
      });
    }

    res.json({ records: data.records });
  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ── GET /api/validation-rules/:id ─────────────────────────────────────────────
app.get("/api/validation-rules/:id", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const instanceUrl = req.headers["sf-instance-url"];
    const { id } = req.params;

    console.log("=== GET /api/validation-rules/:id ===");
    console.log("ID:", id);
    console.log(
      "Token received:",
      token ? token.substring(0, 30) + "..." : "MISSING",
    );
    console.log("Instance URL:", instanceUrl || "MISSING");

    if (!token || !instanceUrl) {
      return res.status(400).json({ error: "Missing token or instance URL" });
    }

    const sfUrl = `${instanceUrl}/services/data/v61.0/tooling/sobjects/ValidationRule/${id}`;
    console.log("Calling Salesforce URL:", sfUrl);

    const response = await fetch(sfUrl, { headers: authHeaders(token) });
    const data = await response.json();

    console.log("Salesforce response status:", response.status);
    console.log("Salesforce response body:", JSON.stringify(data));

    if (!response.ok) {
      return res.status(response.status).json({
        error: data[0]?.message || JSON.stringify(data),
      });
    }

    res.json(data);
  } catch (err) {
    console.error("Error fetching rule:", err);
    res.status(500).json({ error: "Failed to fetch rule" });
  }
});

// ── PATCH /api/validation-rules/:id/toggle ────────────────────────────────────
app.patch("/api/validation-rules/:id/toggle", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const instanceUrl = req.headers["sf-instance-url"];
    const { id } = req.params;
    const { active } = req.body;

    console.log("=== PATCH /api/validation-rules/:id/toggle ===");
    console.log("ID:", id, "| Active:", active);
    console.log(
      "Token received:",
      token ? token.substring(0, 30) + "..." : "MISSING",
    );
    console.log("Instance URL:", instanceUrl || "MISSING");

    if (!token || !instanceUrl) {
      return res.status(400).json({ error: "Missing token or instance URL" });
    }
    if (active === undefined) {
      return res
        .status(400)
        .json({ error: "Missing 'active' field in request body" });
    }

    // Step 1 — fetch full rule to get Metadata compound field
    const getUrl = `${instanceUrl}/services/data/v61.0/tooling/sobjects/ValidationRule/${id}`;
    console.log("Fetching rule from:", getUrl);

    const getRes = await fetch(getUrl, { headers: authHeaders(token) });
    const getBody = await getRes.json();

    console.log("Fetch rule status:", getRes.status);
    console.log("Fetch rule body:", JSON.stringify(getBody));

    if (!getRes.ok) {
      return res.status(getRes.status).json({
        error: getBody[0]?.message || "Failed to read rule",
      });
    }

    // Step 2 — PATCH with updated Metadata
    const patchUrl = `${instanceUrl}/services/data/v61.0/tooling/sobjects/ValidationRule/${id}`;
    const patchBody = { Metadata: { ...getBody.Metadata, active } };
    console.log("Patching rule at:", patchUrl);
    console.log("Patch body:", JSON.stringify(patchBody));

    const patchRes = await fetch(patchUrl, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(patchBody),
    });

    console.log("Patch response status:", patchRes.status);

    if (patchRes.status === 204) {
      return res.json({ success: true, id, active });
    }

    const patchData = await patchRes.json();
    console.log("Patch error body:", JSON.stringify(patchData));
    res.status(patchRes.status).json({
      error: patchData[0]?.message || "Failed to toggle rule",
    });
  } catch (err) {
    console.error("Error toggling rule:", err);
    res.status(500).json({ error: "Failed to toggle rule" });
  }
});

// ── POST /api/deploy-validation-rules ────────────────────────────────────────
// Body: [{ id: "...", active: true|false }, ...]
app.post("/api/deploy-validation-rules", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const instanceUrl = req.headers["sf-instance-url"];
    const rules = req.body;

    console.log("=== POST /api/deploy-validation-rules ===");
    console.log(
      "Token received:",
      token ? token.substring(0, 30) + "..." : "MISSING",
    );
    console.log("Instance URL:", instanceUrl || "MISSING");
    console.log("Rules to deploy:", JSON.stringify(rules));

    if (!token || !instanceUrl) {
      return res.status(400).json({ error: "Missing token or instance URL" });
    }
    if (!Array.isArray(rules) || rules.length === 0) {
      return res
        .status(400)
        .json({ error: "No rules provided in request body" });
    }

    const results = [];
    const errors = [];

    for (const rule of rules) {
      try {
        console.log(`Processing rule ${rule.id} → active: ${rule.active}`);

        // Fetch full Metadata
        const getRes = await fetch(
          `${instanceUrl}/services/data/v61.0/tooling/sobjects/ValidationRule/${rule.id}`,
          { headers: authHeaders(token) },
        );
        const getBody = await getRes.json();
        console.log(`Fetch rule ${rule.id} status:`, getRes.status);

        if (!getRes.ok) {
          errors.push({
            id: rule.id,
            error: "Failed to read rule before deploy",
          });
          continue;
        }

        // PATCH with new active state
        const patchRes = await fetch(
          `${instanceUrl}/services/data/v61.0/tooling/sobjects/ValidationRule/${rule.id}`,
          {
            method: "PATCH",
            headers: authHeaders(token),
            body: JSON.stringify({
              Metadata: { ...getBody.Metadata, active: rule.active },
            }),
          },
        );

        console.log(`Patch rule ${rule.id} status:`, patchRes.status);

        if (patchRes.status === 204) {
          results.push({ id: rule.id, success: true });
        } else {
          const errData = await patchRes.json();
          console.log(`Patch rule ${rule.id} error:`, JSON.stringify(errData));
          errors.push({
            id: rule.id,
            error: errData[0]?.message || "Unknown error",
          });
        }
      } catch (e) {
        console.error(`Error processing rule ${rule.id}:`, e);
        errors.push({ id: rule.id, error: e.message });
      }
    }

    console.log("Deploy results:", JSON.stringify(results));
    console.log("Deploy errors:", JSON.stringify(errors));

    res.json({ success: errors.length === 0, results, errors });
  } catch (err) {
    console.error("Error deploying rules:", err);
    res.status(500).json({ error: "Failed to deploy rules" });
  }
});
// ── TEMP TEST ROUTE — remove after testing ────────────────────────────────────
app.get("/api/test-token", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const instanceUrl = req.headers["sf-instance-url"];

    console.log("=== TEST TOKEN ===");
    console.log("Token:", token ? token.substring(0, 30) + "..." : "MISSING");
    console.log("Instance URL:", instanceUrl);

    // Test 1 — basic API access
    const test1 = await fetch(`${instanceUrl}/services/data/v61.0/`, {
      headers: authHeaders(token),
    });
    const test1Body = await test1.json();
    console.log("Test1 (basic API) status:", test1.status);
    console.log("Test1 body:", JSON.stringify(test1Body).substring(0, 200));

    // Test 2 — Tooling API access
    const test2 = await fetch(
      `${instanceUrl}/services/data/v61.0/tooling/query/?q=SELECT+Id,ValidationName+FROM+ValidationRule+LIMIT+1`,
      { headers: authHeaders(token) },
    );
    const test2Body = await test2.json();
    console.log("Test2 (Tooling API) status:", test2.status);
    console.log("Test2 body:", JSON.stringify(test2Body).substring(0, 200));

    // Test 3 — token identity info
    const test3 = await fetch(`${instanceUrl}/services/oauth2/userinfo`, {
      headers: authHeaders(token),
    });
    const test3Body = await test3.json();
    console.log("Test3 (userinfo) status:", test3.status);
    console.log("Test3 body:", JSON.stringify(test3Body).substring(0, 200));

    res.json({
      basicApi: { status: test1.status, body: test1Body },
      toolingApi: { status: test2.status, body: test2Body },
      userInfo: { status: test3.status, body: test3Body },
    });
  } catch (err) {
    console.error("Test error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  console.log(
    `SF_CLIENT_ID loaded: ${SF_CLIENT_ID ? "✅ YES" : "❌ NO - check .env file"}`,
  );
  console.log(
    `SF_CLIENT_SECRET loaded: ${SF_CLIENT_SECRET ? "✅ YES" : "❌ NO - check .env file"}`,
  );
});
