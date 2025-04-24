import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/HeaderComponent";
import "../styles/LibraryPage.css";
import axios from "axios";

interface Game {
  title: string;
  cover: string;
  path: string;
}

const Library: React.FC = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  useEffect(() => {
    // Función para obtener los juegos desde el backend
    const loadGames = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/games/library");
        // Se espera que la respuesta sea un array de objetos con los campos: title, cover y path
        setGames(response.data);
      } catch (error) {
        console.error("Error al cargar los juegos:", error);
      }
    };

    loadGames();
  }, []);

  const addToCart = async (game: string) => {
    try {
      const response = await axios.post("http://localhost:3000/api/cart", { game });
      console.log(response.data);
      setAddedToCart(game);
      setTimeout(() => setAddedToCart(null), 2000);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
    }
  };

  return (
    <div className="library-container">
    <Header />
    <div className="library-layout">
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
