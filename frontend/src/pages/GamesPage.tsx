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
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({
    review_type: "positive",
    description: "",
    recommended: true
  });

  useEffect(() => {
    const fetchGameDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const [gameResponse, reviewsResponse] = await Promise.all([
          axios.get<GameDetails>(`http://localhost:3000/api/games/details/${id}`, {
            withCredentials: true
          }),
          axios.get<Review[]>(`http://localhost:3000/api/games/${id}/reviews`, {
            withCredentials: true
          })
        ]);
        
        setGameDetails(gameResponse.data);
        setReviews(reviewsResponse.data);
      } catch (error) {
        console.error("Error fetching game details:", error);
        setGameDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to submit a review');
            return;
        }

        console.log('Submitting review:', {
            review_type: newReview.review_type,
            description: newReview.description,
            recommended: newReview.recommended
        });

        const response = await axios.post(
            `http://localhost:3000/api/games/${id}/reviews`,
            newReview,
            { 
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Review submission response:', response.data);

        // Refresh reviews after submission
        const reviewsResponse = await axios.get<Review[]>(`http://localhost:3000/api/games/${id}/reviews`);
        setReviews(reviewsResponse.data);
        
        // Reset form
        setNewReview({
            review_type: "positive",
            description: "",
            recommended: true
        });

        alert('Review submitted successfully!');
    } catch (error) {
        console.error("Error submitting review:", error);
        if (error instanceof AxiosError) {
            const errorMessage = error.response?.data?.message || 'Error submitting review';
            alert(errorMessage);
        } else {
            alert('An unexpected error occurred');
        }
    }
  };

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
