// src/pages/GamesPage.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
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
          { withCredentials: true }
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

  if (loading) return <div className="loading-message">Loading...</div>;
  if (!gameDetails) return <div className="error-message">Game not found</div>;

  return (
    <div className="gamepage-container">
      <Header />

      {/* Game Header Section */}
      <GameHeader title={gameDetails.title} gameId={gameDetails.id} />

      <div className="gamepage-main-content">
        <div className="gamepage-left-column">
          <div className="gamepage-media-section">
            <img
              src={gameDetails.sliderImage}
              alt={gameDetails.title}
              className="gamepage-main-image"
            />
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