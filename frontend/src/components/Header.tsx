import React from "react";
import { Link } from "react-router-dom";
import "../assets/Header.css"; 

interface HeaderProps {
  username: string;
}

const Header: React.FC<HeaderProps> = ({ username }) => {
  return (
    <header className="header">
      <h1 className="title">Across</h1>
      <Link to="/" className="link">Home</Link>
      <Link to="/library" className="link">Library</Link>
      <Link to="/cart" className="link">Cart</Link>
      <Link to="/downloads" className="link">Downloads</Link>
      <Link to="/wishlist" className="link">Wishlist</Link>
      <Link to="/login" className="link">Login</Link>
      <Link to="/register" className="link">Register</Link>
      <Link to="/profile" className="link">{username}</Link>
    </header>
  );
};

export default Header;
