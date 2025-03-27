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
  { title: "Elden Ring", 
    cover: eldenRingCover, // Usar la variable importada
    path: "/EldenRing" 
  },
  {
    title: "Borderlands",
    cover: borderlandsCover, // Usar la variable importada
    path: "/Borderlands"
  },
  { title: "Half-life", 
    cover: halfLifeCover, // Usar la variable importada
    path: "/Half-life" 
  },
  { 
    title: "Crysis", 
    cover: crysisCover, // Usar la variable importada
    path: "/Crysis" 
  },
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
    <div className="container">
      <Header username="Player123" />

      <aside className="sidebar">
        <h2>Juegos</h2>
        <ul>
          {games.map((game, index) => (
            <li key={index} onClick={() => navigate(game.path)}>
              {game.title}
            </li>
          ))}
        </ul>
      </aside>

      <main className="content">
        <h1>Carátulas de Juegos</h1>
        <div className="gallery">
          {games.map((game, index) => (
            <div key={index} className="game-item">
              <img
                src={game.cover}
                alt={game.title}
                className="game-cover"
                onClick={() => navigate(game.path)}
              />
              <div className="button-container">
                <button onClick={() => addToCart(game.title)}>Añadir al carrito</button>
              </div>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
};

export default Library;
