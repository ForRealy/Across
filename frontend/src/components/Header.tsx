import React from "react";
import { Link } from "react-router-dom"; // Para navegación

interface HeaderProps {
  username: string;
}

const Header: React.FC<HeaderProps> = ({ username }) => {
  return (
    <header style={styles.header}>
      <h1 style={styles.title}>Store</h1>
      <nav>
        <Link to="/library" style={styles.link}>Library</Link>
        <Link to="/downloads" style={styles.link}>Downloads</Link>
        <span style={styles.username}>{username}</span>
      </nav>
    </header>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#333",
    color: "#fff",
    width: "100%",
    boxSizing: "border-box" as "border-box", // Corregido el tipo de boxSizing
  },
  title: { margin: 0 },
  link: { color: "#fff", textDecoration: "none", margin: "0 10px" },
  username: { fontWeight: "bold" },
};

export default Header;
