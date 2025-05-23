import React from "react";
import "../styles/Spinner.css";

interface SpinnerProps {
  message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message }) => {
  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <div className="spinner" />
        {message && <p className="spinner-message">{message}</p>}
      </div>
    </div>
  );
};

export default Spinner;
