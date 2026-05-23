import React from "react";

export default function ToggleButton({ active, onClick }) {
  return (
    <button onClick={onClick}>{active ? "Deactivate" : "Activate"}</button>
  );
}
