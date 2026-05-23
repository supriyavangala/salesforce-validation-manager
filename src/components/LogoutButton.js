import React from "react";

export default function LogoutButton() {
  const handleLogout = () => {
    localStorage.removeItem("sf_access_token");
    localStorage.removeItem("sf_instance_url");
    window.location.href = "/login";
  };

  return <button onClick={handleLogout}>Log Out</button>;
}
