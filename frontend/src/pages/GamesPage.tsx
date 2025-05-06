import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/HeaderComponent";
import "../styles/GamesPage.css";

// Configure axios to include credentials
axios.defaults.withCredentials = true;

interface GameDetails {
  title: string;
  cover: string;
  sliderImage: string;
  rating: number;
  releaseDate?: string;
  description?: string;
  developer?: string;
  publisher?: string;
  tags?: string[];
}

const GamesPage: React.FC = () => {
  const { title } = useParams<{ title: string }>();
  const gameTitle = title?.replace(/-/g, ' ') || "Game";
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        // Try to fetch from both popular and library endpoints
        const [popularResponse, libraryResponse] = await Promise.all([
          axios.get(`http://localhost:3000/api/games/popular`, {
            withCredentials: true
          }),
          axios.get(`http://localhost:3000/api/games/library`, {
            withCredentials: true
          })
        ]);

        // Search for the game in both responses
        const game = [...popularResponse.data, ...libraryResponse.data].find(
          (g: GameDetails) => g.title.toLowerCase() === gameTitle.toLowerCase()
        );

        if (game) {
          setGameDetails(game);
        }
      } catch (error) {
        console.error("Error fetching game details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [gameTitle]);

  const addToCart = async () => {
    try {
      await axios.post("http://localhost:3000/api/cart/add", 
        { game: gameDetails?.title },
        { withCredentials: true }
      );
      alert("Producto añadido al carrito correctamente");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error al añadir al carrito");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!gameDetails) {
    return <div>Game not found</div>;
  }

  return (
    <div className="gamepage-container">
      <Header />

      <div className="gamepage-header">
        <h1 className="gamepage-title">{gameDetails.title}</h1>
        <div className="gamepage-action-buttons">
          <button className="btn-gray">Ignore</button>
          <button className="btn-gray">Follow</button>
          <button className="btn-gray">Wishlist ❤️</button>
          <button className="btn-gray">Browse All DLCs</button>
          <button className="btn-gray">Community Hub</button>
        </div>
      </div>

      <div className="gamepage-main-content">
        <div className="gamepage-left-column">
          <div className="gamepage-media-section">
            <img src={gameDetails.sliderImage} alt={gameDetails.title} className="gamepage-main-image" />
            <div className="gamepage-cart-buttons">
              <button onClick={addToCart} className="btn-cart">Add to cart</button>
            </div>
          </div>

          <div className="gamepage-edition-info">
            <p><strong>{gameDetails.title}</strong></p>
            <p>WEEKEND DEAL! Offer ends 19 October</p>

            <p><strong>{gameDetails.title} Deluxe Edition</strong></p>
            <p>WEEKEND DEAL! Offer ends 19 October</p>

            <p><strong>Includes:</strong></p>
            <p>{gameDetails.title} (full game)</p>
            <p>Digital Artbook & Original Soundtrack</p>
          </div>
        </div>

        <div className="gamepage-right-column">
          <img src={gameDetails.cover} alt={gameDetails.title} className="gamepage-side-image" />
          <p className="gamepage-description">
            {gameDetails.description || `THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the ${gameDetails.title}.`}
          </p>
          <div className="gamepage-info-panel">
            <p><strong>Reviews:</strong> {gameDetails.rating ? `Very Positive (${gameDetails.rating.toFixed(1)}/100)` : 'No reviews yet'}</p>
            <p><strong>Release Date:</strong> {gameDetails.releaseDate || 'Coming Soon'}</p>
            <p><strong>Developer:</strong> {gameDetails.developer || 'Unknown'}</p>
            <p><strong>Publisher:</strong> {gameDetails.publisher || 'Unknown'}</p>
            <p><strong>Tags:</strong> {gameDetails.tags?.join(', ') || 'Action, RPG'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesPage;
