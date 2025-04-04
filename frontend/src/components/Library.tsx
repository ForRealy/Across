import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../assets/Library.css";

// Importar las imágenes desde la carpeta src
import eldenRingCover from "../media/eldenring.jpeg";
import borderlandsCover from "../media/bordelands.jpeg";
import halfLifeCover from "../media/half-life.jpeg";
import crysisCover from "../media/crysis.jpeg";

const games = [
  { title: "Elden Ring", cover: eldenRingCover, path: "/EldenRing" },
  { title: "Borderlands", cover: borderlandsCover, path: "/Borderlands" },
  { title: "Half-life", cover: halfLifeCover, path: "/Half-life" },
  { title: "Crysis", cover: crysisCover, path: "/Crysis" },
];

const Library: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<string[]>([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const addToCart = (game: string) => {
    const updatedCart = [...cart, game];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
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
                    Añadir al carrito
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
