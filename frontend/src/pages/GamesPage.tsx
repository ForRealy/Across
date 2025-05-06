import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/HeaderComponent";
import "../styles/GamesPage.css";

// Configure axios to include credentials
axios.defaults.withCredentials = true;

/**
 * Ahora usamos sólo los campos que nuestro endpoint realmente devuelve:
 */
interface GameDetails {
  id?: number;
  title: string;
  cover: string;
  sliderImage?: string;  // Hacer opcional
  rating?: number;
  releaseDate?: string;
  daysRemaining?: number;
}

const GamesPage: React.FC = () => {
  // Antes teníamos `title`, ahora recogemos `id`
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
        // Llamamos al endpoint /details/:id
        const response = await axios.get<GameDetails>(`http://localhost:3000/api/games/details/${id}`);
        setGameDetails(response.data);
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
    try {
      await axios.post(
        "http://localhost:3000/api/cart/add",
        { gameId: gameDetails?.id },
        { withCredentials: true }
      );
      alert("Producto añadido al carrito correctamente");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error al añadir al carrito");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!gameDetails) return <div>Game not found</div>;

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
    </div>
  );
};

export default GamesPage;
