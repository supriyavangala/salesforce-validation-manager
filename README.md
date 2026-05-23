# Salesforce Validation Rules Manager

A React + Node.js application to view, toggle, and deploy Salesforce validation rules using the Tooling API and Metadata API.

---

## 🚀 Features

- Login with Salesforce OAuth
- View all validation rules for the Account object
- Toggle rules locally (without immediate backend calls)
- Deploy all changes at once via Metadata API
- Simple, recruiter‑friendly UI with a consistent blue theme

---

## 🛠️ Tech Stack

- **Frontend:** React, React Router
- **Backend:** Node.js, Express, JSforce
- **APIs:** Salesforce Tooling API & Metadata API

---

## 📦 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/salesforce-validation-manager.git
cd salesforce-validation-manager

2. Install dependencies
npm install

3. Configure environment variables
Create a .env file in the project root:
REACT_APP_SF_CLIENT_ID=your-salesforce-connected-app-client-id
REACT_APP_SF_CALLBACK_URL=http://localhost:3000/oauth/callback

4. Start backend
node server.js
Backend runs at: http://localhost:4000

5. Start frontend
npm start
Frontend runs at: http://localhost:3000

📂 Project Structure
src/
  components/   # Navbar, LoginButton, RulesList, DeployButton, LogoutButton
  pages/        # HomePage, LoginPage, DashboardPage, SettingsPage, DeployPage
  services/     # salesforceApi.js
server.js       # Express backend with Salesforce API routes

👩‍💻 Author
Built by Supriya — Full‑stack developer passionate about Salesforce integrations and cloud infrastructure.
```
