import React from "react";
import { Link } from "react-router-dom";
import { userAuth } from "../pages/AuthContext"; // Importamos el contexto de autenticación
import "../styles/Header.css";

const Header: React.FC = () => {
  const { user, logout } = userAuth(); // Obtener usuario autenticado y función logout

  return (
    <header className="header-container">
      <h1 className="header-title">Across</h1>
      <nav className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/library" className="nav-link">Library</Link>

        {/* Si el usuario está autenticado, mostramos su perfil y el botón de logout */}
        {user ? (
          <>
            <Link to="/cart" className="nav-link">Cart</Link>
            <Link to="/downloads" className="nav-link">Downloads</Link>
            <Link to="/profile" className="nav-link username-link">{user.username}</Link>
            <button onClick={logout} className="nav-link logout-button">Logout</button>

          </>
        ) : (
          // Si no está autenticado, mostramos Login y Register
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
