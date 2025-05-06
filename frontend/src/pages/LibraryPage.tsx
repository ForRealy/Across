import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/HeaderComponent";
import "../styles/LibraryPage.css";
import axios from "axios";

// Configure axios to include credentials
axios.defaults.withCredentials = true;

interface Game {
  title: string;
  cover: string;
  path: string;
  rating: number;
}

const Library: React.FC = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/games/library", {
          withCredentials: true
        });
        setGames(response.data);
      } catch (error) {
        console.error("Error al cargar los juegos:", error);
      }
    };

    loadGames();
  }, []);

  const addToCart = async (game: string) => {
    try {
      await axios.post("http://localhost:3000/api/cart/add", 
        { game },
        { withCredentials: true }
      );
      setAddedToCart(game);
      setTimeout(() => setAddedToCart(null), 2000);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
    }
  };

  const goToGamePage = (gameTitle: string) => {
    const slug = gameTitle
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    navigate(`/${slug}`);
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
                onClick={() => goToGamePage(game.title)}
                className="library-game-link"
              >
                {game.title}
              </li>
            ))}
          </ul>
        </aside>
        <main className="library-content">
          <div className="library-gallery">
            {games.map((game, index) => (
              <div key={index} className="library-game-item">
                <img
                  src={game.cover}
                  alt={game.title}
                  className="library-game-cover"
                  onClick={() => goToGamePage(game.title)}
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
