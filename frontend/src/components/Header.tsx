import React from "react";
import { Link } from "react-router-dom";
import "../assets/Header.css"; 

interface HeaderProps {
  username: string;
}

const Header: React.FC<HeaderProps> = ({ username }) => {
  return (
    <header className="header">
      <h1 className="title">Store</h1>
        <Link to="/" className="link">Home</Link>
        <Link to="/library" className="link">Library</Link>
        <Link to="/cart" className="link">Cart</Link>
        <Link to="/downloads" className="link">Downloads</Link>
        <Link to="/profile" className="link">{username}</Link>
        <p> notificaciones </p>
    </header>
  );
};

export default Header;
