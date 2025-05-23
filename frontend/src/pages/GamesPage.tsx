import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/HeaderComponent";
import GameHeader from "../components/GameHeaderComponent";
import ReviewsSection from "../components/ReviewComponent";
import Spinner from "../components/Spinner";  // Import Spinner
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
  description?: string;
  price?: number;
}

const GamesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      setLoading(true);
      setError(null);
      if (!id) {
        setError("Game ID missing");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get<GameDetails>(
          `http://localhost:3000/api/games/details/${id}`,
          { withCredentials: true }
        );
        setGameDetails(response.data);
      } catch (err: any) {
        console.error("Error fetching game details:", err);
        setError(err.message || "Error al cargar detalles del juego");
      } finally {
        setLoading(false);
      }
    };
    fetchGameDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="gamepage-container">
        <Header />
        <div className="gamepage-loading">
          <Spinner/>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gamepage-container">
        <Header />
        <div className="gamepage-error">{error}</div>
      </div>
    );
  }

  if (!gameDetails) {
    return (
      <div className="gamepage-container">
        <Header />
        <div className="gamepage-error">Game not found</div>
      </div>
    );
  }

  return (
    <div className="gamepage-container">
      <Header />

      {/* Game Header Section */}
      <GameHeader
        title={gameDetails.title}
        gameId={gameDetails.id}
        daysRemaining={gameDetails.daysRemaining}
        releaseDate={gameDetails.releaseDate}
      />

      <div className="gamepage-main-content">
        <div className="gamepage-left-column">
          <div className="gamepage-media-section">
            <img
              src={gameDetails.sliderImage}
              alt={gameDetails.title}
              className="gamepage-main-image"
            />
          </div>
          {/* Descripción del juego */}
          <div className="gamepage-description-panel">
            <h3>Description</h3>
            <p>{gameDetails.description || "No hay descripción disponible."}</p>
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
              <strong>Rating:</strong>{' '}
              {gameDetails.rating !== undefined
                ? `${gameDetails.rating.toFixed(1)}/100`
                : "No reviews yet"}
            </p>
            <p>
              <strong>Release Date:</strong>{' '}
              {gameDetails.releaseDate || "Coming Soon"}
            </p>
            {gameDetails.daysRemaining !== undefined && (
              <p>
                <strong>Días para lanzamiento:</strong>{' '}
                {gameDetails.daysRemaining}
              </p>
            )}
            <p>
              <strong>Price:</strong>{' '}
              {gameDetails.price !== undefined
                ? `$${gameDetails.price.toFixed(2)}`
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewsSection gameId={id!} />
    </div>
  );
};

export default GamesPage;
