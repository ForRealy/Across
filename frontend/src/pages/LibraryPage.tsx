import React, { useState, useEffect } from "react";
import Header from "../components/HeaderComponent";
import AddToCartButton from "../components/AddToCartButtonComponent";
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
  rating: number;
  price?: number;
}

const Library: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartStatus, setCartStatus] = useState<{
    [key: number]: 'loading' | 'success' | 'error' | undefined;
  }>({});

  useEffect(() => {
    const loadGames = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/games/library", {
          withCredentials: true,
          params: {
            includeCover: true
          }
        });
        setGames(response.data);
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

  const updateCartStatus = (gameId: number, status: 'loading' | 'success' | 'error' | undefined) => {
    setCartStatus(prev => ({ ...prev, [gameId]: status }));
  };

  const goToGamePage = (gameId: number) => {
    window.location.href = `/details/${gameId}`; 
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="star full">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">★</span>);
      }
    }
    
    return stars;
  };

  if (loading) return <div className="loading-message">Cargando juegos...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (games.length === 0) return <div className="empty-message">No hay juegos disponibles</div>;

  return (
    <div className="library-container">
      <Header />
      <div className="library-layout">
        <aside className="library-sidebar">
          <h2 className="library-sidebar-title">Juegos</h2>
          <ul className="library-game-list">
            {games.map((game) => (
              <li
                key={game.id}
                onClick={() => goToGamePage(game.id)}
                className="library-game-link"
              >
                {game.title}
              </li>
            ))}
          </ul>
        </aside>
        <main className="library-content">
          <div className="library-gallery">
            {games.map((game) => (
              <div key={game.id} className="library-game-item">
                <img
                  src={game.cover}
                  alt={game.title}
                  className="library-game-cover"
                  onClick={() => goToGamePage(game.id)}
                />
                <div className="library-game-info">
                  <div className="star-rating">
                    {renderStars(game.rating)}
                    <span className="rating-value">
                      ({game.rating?.toFixed(1) || 'N/A'})
                    </span>
                  </div>
                  {game.price && (
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