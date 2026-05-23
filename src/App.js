import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CallbackPage from "./pages/CallbackPage";
import SettingsPage from "./pages/SettingsPage";
import RuleDetailsPage from "./pages/RuleDetailsPage";
import DeployPage from "./pages/DeployPage";
import ErrorPage from "./pages/ErrorPage";
import { isLoggedIn } from "./services/salesforceApi";

// Redirects to /login if not authenticated
function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="*" element={<ErrorPage />} />

          {/* Protected routes — redirect to /login if not logged in */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/deploy"
            element={
              <PrivateRoute>
                <DeployPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/rules/:id"
            element={
              <PrivateRoute>
                <RuleDetailsPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
