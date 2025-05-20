// src/pages/LibraryPage.tsx
import React, { useState, useEffect } from "react";
import Header from "../components/HeaderComponent";
import AddToCartButton from "../components/AddToCartButtonComponent";
import StarRating from "../components/StarRatingComponent";
import "../styles/LibraryPage.css";
import axios, { AxiosError } from "axios";

// Configuración global de axios
axios.defaults.withCredentials = true;

interface Game {
  id: number;
  title: string;
  cover: string;
  sliderImage?: string;
  path: string;
  rating: number;     // out of 5
  price?: number;
}

const Library: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartStatus, setCartStatus] = useState<{ [key: number]: 'loading' | 'success' | 'error' | undefined }>({});

  useEffect(() => {
    const loadGames = async () => {
      try {
        const response = await axios.get<Game[]>(
          "http://localhost:3000/api/games/library",
          { withCredentials: true, params: { includeCover: true } }
        );
        setGames(response.data);
        setFilteredGames(response.data);
      } catch (err) {
        if (err instanceof AxiosError) {
          setError(err.response?.data?.message || "Error al cargar los juegos");
          console.error("Error loading games:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredGames(games);
    } else {
      setFilteredGames(
        games.filter((game) =>
          game.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, games]);

  const updateCartStatus = (gameId: number, status: 'loading' | 'success' | 'error' | undefined) => {
    setCartStatus((prev) => ({ ...prev, [gameId]: status }));
  };

  const goToGamePage = (gameId: number) => {
    window.location.href = `/details/${gameId}`;
  };

  if (loading) return <div className="loading-message">Cargando juegos...</div>;
  if (error)   return <div className="error-message">{error}</div>;
  if (filteredGames.length === 0)
    return <div className="empty-message">No hay juegos disponibles</div>;

  return (
    <div className="library-container">
      <Header />

      <div className="library-layout">
        <aside className="library-sidebar">
          <h2 className="library-sidebar-title">Buscar juegos</h2>
          <input
            type="text"
            placeholder="Buscar por título..."
            className="library-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </aside>

        <main className="library-content">
          <div className="library-gallery">
            {filteredGames.map((game) => (
              <div key={game.id} className="library-game-item">
                <img
                  src={game.cover}
                  alt={game.title}
                  className="library-game-cover"
                  onClick={() => goToGamePage(game.id)}
                />

                <div className="library-game-info">
                  <h3 className="library-game-title">{game.title}</h3>
                  <div className="star-rating-wrapper">
                    <StarRating rating={game.rating} />
                  </div>
                  {game.price !== undefined && (
                    <span className="library-game-price">
                      ${game.price.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="library-button-container">
                  <AddToCartButton
                    gameId={game.id}
                    status={cartStatus[game.id]}
                    setStatus={(status) => updateCartStatus(game.id, status)}
                    setError={setError}
                  />
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
