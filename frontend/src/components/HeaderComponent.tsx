import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userAuth } from "../pages/AuthContext";
import "../styles/Header.css";

const Header: React.FC = () => {
    const { user, logout } = userAuth(); 
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/"); 
    };

    useEffect(() => {
    }, []); 

    return (
        <header className="header-container">
            <h1 className="header-title">Across</h1>
            <nav className="nav-links">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/library" className="nav-link">Library</Link>

                {!user ? (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="nav-link">Register</Link>
                    </>
                ) : (
                    <>
                        <Link to="/cart" className="nav-link">Cart</Link>
                        <Link to="/downloads" className="nav-link">Downloads</Link>
                        <Link to="/profile" className="nav-link username-link">{user.username}</Link>
                        <button onClick={handleLogout} className="nav-link logout-button">Logout</button>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;
