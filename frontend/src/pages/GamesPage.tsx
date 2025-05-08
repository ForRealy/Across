// src/pages/GamesPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import Header from "../components/HeaderComponent";
import GameHeader from "../components/GameHeaderComponent";
import ReviewsSection from "../components/ReviewComponent";
import "../styles/GamesPage.css";

axios.defaults.withCredentials = true;

interface GameDetails {
  id?: number;
  title: string;
  cover: string;
  sliderImage?: string;
  rating?: number;
  releaseDate?: string;
  daysRemaining?: number;
}

const GamesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const gameResponse = await axios.get<GameDetails>(
          `http://localhost:3000/api/games/details/${id}`,
          {
            withCredentials: true
          }
        );
        
        setGameDetails(gameResponse.data);
      } catch (error) {
        console.error("Error fetching game details:", error);
        setGameDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [id]);

  const addToCart = async () => {
    if (!gameDetails?.id) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.post(
        "http://localhost:3000/api/cart/add",
        { productId: gameDetails.id },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
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

  if (loading) return <div>Loading...</div>;
  if (!gameDetails) return <div>Game not found</div>;

  return (
    <div className="gamepage-container">
      <Header />

      {/* Game Header Section */}
      <GameHeader title={gameDetails.title} />

      <div className="gamepage-main-content">
        <div className="gamepage-left-column">
          <div className="gamepage-media-section">
            <img
              src={gameDetails.sliderImage}
              alt={gameDetails.title}
              className="gamepage-main-image"
            />
            <div className="gamepage-cart-buttons">
              <button onClick={addToCart} className="btn-cart">
                Add to cart
              </button>
            </div>
          </div>
        </div>

        <div className="gamepage-right-column">
          <img
            src={gameDetails.cover}
            alt={gameDetails.title}
            className="gamepage-side-image"
          />
          <div className="gamepage-info-panel">
            <p>
              <strong>Rating:</strong>{" "}
              {gameDetails.rating
                ? `${gameDetails.rating.toFixed(1)}/100`
                : "No reviews yet"}
            </p>
            <p>
              <strong>Release Date:</strong>{" "}
              {gameDetails.releaseDate || "Coming Soon"}
            </p>
            {gameDetails.daysRemaining !== undefined && (
              <p>
                <strong>Días para lanzamiento:</strong>{" "}
                {gameDetails.daysRemaining}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewsSection gameId={id!} />
    </div>
  );
};

export default GamesPage;
