import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/HeaderComponent";
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
  const navigate = useNavigate();
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

  const addToCart = async (gameId: number) => {
    setCartStatus(prev => ({ ...prev, [gameId]: 'loading' }));
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        "http://localhost:3000/api/cart/add",
        { productId: gameId },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setCartStatus(prev => ({ ...prev, [gameId]: 'success' }));
        setTimeout(() => 
          setCartStatus(prev => ({ ...prev, [gameId]: undefined }))
        , 2000);
      } else {
        throw new Error(response.data.message || "Error al agregar al carrito");
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        console.error("Error adding to cart:", err);
        setCartStatus(prev => ({ ...prev, [gameId]: 'error' }));
        setTimeout(() => 
          setCartStatus(prev => ({ ...prev, [gameId]: undefined }))
        , 3000);
        setError(err.response?.data?.message || "Error al agregar al carrito");
      }
    }
  };

  const goToGamePage = (gameId: number) => {
    window.location.href = `/details/${gameId}`; 
  };

  // Función para renderizar estrellas de valoración
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
                  <button
                    className={`library-add-button ${
                      cartStatus[game.id] === 'success' ? 'added' : 
                      cartStatus[game.id] === 'error' ? 'error' : ''
                    }`}
                    onClick={() => addToCart(game.id)}
                    disabled={cartStatus[game.id] === 'loading'}
                  >
                    {cartStatus[game.id] === 'loading' ? 'Añadiendo...' :
                     cartStatus[game.id] === 'success' ? '✓ Añadido' :
                     cartStatus[game.id] === 'error' ? 'Error' : 'Añadir al carrito'}
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