import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../styles/Library.css";
import axios from "axios";

const Library: React.FC = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<{ title: string; cover: string; path: string }[]>([]);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  useEffect(() => {
    // Simular datos de juegos
    const simulatedGames = [
      { title: "Elden Ring", cover: "/media/eldenring.jpeg", path: "/EldenRing" },
      { title: "Borderlands", cover: "/media/bordelands.jpeg", path: "/Borderlands" },
      { title: "Half-life", cover: "/media/half-life.jpeg", path: "/Half-life" },
      { title: "Crysis", cover: "/media/crysis.jpeg", path: "/Crysis" },
    ];
    setGames(simulatedGames);
  }, []);

  const addToCart = async (game: string) => {
    try {
      const response = await axios.post("http://localhost:3000/api/cart", { game });
      console.log(response.data); // Ver el carrito actualizado en la consola
      setAddedToCart(game);
      setTimeout(() => setAddedToCart(null), 2000); // Eliminar el mensaje "Añadido" después de 2 segundos
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
    }
  };

  return (
    <div className="library-container">
      <Header />
      <div className="library-main-content">
        <aside className="library-sidebar">
          <h2 className="library-sidebar-title">Juegos</h2>
          <ul className="library-game-list">
            {games.map((game, index) => (
              <li
                key={index}
                onClick={() => navigate(game.path)}
                className="library-game-link"
              >
                {game.title}
              </li>
            ))}
          </ul>
        </aside>

        <main className="library-content">
          <h1 className="library-title">Juegos</h1>
          <div className="library-gallery">
            {games.map((game, index) => (
              <div key={index} className="library-game-item">
                <img
                  src={game.cover}
                  alt={game.title}
                  className="library-game-cover"
                  onClick={() => navigate(game.path)}
                />
                <div className="library-button-container">
                  <button
                    className="library-add-button"
                    onClick={() => addToCart(game.title)}
                  >
                    {addedToCart === game.title ? "Añadido" : "Añadir al carrito"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Library;