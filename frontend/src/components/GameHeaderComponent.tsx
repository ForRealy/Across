// src/components/GameHeader.tsx
import React from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/GameHeaderComponent.css"; // Import your CSS file

interface GameHeaderProps {
  title: string;
  gameId?: number;
}

const GameHeader: React.FC<GameHeaderProps> = ({ title, gameId }) => {
  const navigate = useNavigate();

  const addToCart = async () => {
    if (!gameId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.post(
        "http://localhost:3000/api/cart/add",
        { productId: gameId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Producto añadido al carrito correctamente");
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error instanceof AxiosError) {
        alert(error.response?.data?.message || "Error al añadir al carrito");
      } else {
        alert("Error al añadir al carrito");
      }
    }
  };

  const goBack = () => {
    navigate(-1); // Regresa a la página anterior
  };

  return (
    <div className="gamepage-header">
      <h1 className="gamepage-title">{title}</h1>
      <div className="gamepage-action-buttons">
        <button onClick={goBack} className="btn-back">
          Go Back
        </button>
        {gameId && (
          <button onClick={addToCart} className="btn-cart">
            Add to cart
          </button>
        )}
      </div>
    </div>
  );
};

export default GameHeader;
