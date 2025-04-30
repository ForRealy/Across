import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { userAuth } from "../pages/AuthContext";  // Importamos el contexto
import "../styles/Header.css";
import axios from "axios";

const Header: React.FC = () => {
    const { user, logout } = userAuth();  // Usamos el contexto para obtener el usuario y la función logout
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // Clear the cart before logging out
            await axios.delete("http://localhost:3000/api/cart");
            logout();
            navigate("/");
        } catch (error) {
            console.error("Error clearing cart:", error);
            logout();
            navigate("/");
        }
    };

    return(
        <header className="header-container">
            <h1 className="header-title">Across</h1>
            <nav className="nav-links">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/library" className="nav-link">Library</Link>

                {user ? (
                    <>
                        <Link to="/cart" className="nav-link">Cart</Link>
                        <Link to="/downloads" className="nav-link">Downloads</Link>
                        <Link to="/profile" className="nav-link username-link">{user.username}</Link>
                        <button onClick={handleLogout} className="nav-link logout-button">Logout</button>
                    </>
                ) : (
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
