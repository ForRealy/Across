import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios, { AxiosError } from "axios";
import Header from "../components/HeaderComponent";
import "../styles/GamesPage.css";

// Configure axios to include credentials
axios.defaults.withCredentials = true;

interface Review {
  idReview: number;
  idUser: number;
  review_type: string;
  description: string;
  recommended: boolean;
  profile_name?: string;
}

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

        await axios.post(
            `http://localhost:3000/api/games/${id}/reviews`,
            newReview,
            { 
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }
        );

        // Refresh reviews after submission
        const reviewsResponse = await axios.get<Review[]>(`http://localhost:3000/api/games/${id}/reviews`, {
            withCredentials: true
        });
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
      await axios.post(
        "http://localhost:3000/api/cart/add",
        { gameId: gameDetails.id },
        { withCredentials: true }
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

      <div className="gamepage-reviews-section">
        <h2>Reviews</h2>
        
        {/* Review Form */}
        <form onSubmit={handleReviewSubmit} className="review-form">
          <div className="review-form-group">
            <label>Review Type:</label>
            <select
              value={newReview.review_type}
              onChange={(e) => setNewReview({...newReview, review_type: e.target.value})}
            >
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
          
          <div className="review-form-group">
            <label>Description:</label>
            <textarea
              value={newReview.description}
              onChange={(e) => setNewReview({...newReview, description: e.target.value})}
              required
              placeholder="Write your review here..."
            />
          </div>
          
          <div className="review-form-group">
            <label>
              <input
                type="checkbox"
                checked={newReview.recommended}
                onChange={(e) => setNewReview({...newReview, recommended: e.target.checked})}
              />
              Recommend this game
            </label>
          </div>
          
          <button type="submit" className="btn-submit-review">Submit Review</button>
        </form>

        {/* Reviews List */}
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.idReview} className="review-card">
              <div className="review-header">
                <span className="review-author">{review.profile_name || 'Anonymous'}</span>
                <span className={`review-type ${review.review_type}`}>
                  {review.review_type}
                </span>
              </div>
              <p className="review-description">{review.description}</p>
              <div className="review-footer">
                <span className="review-recommendation">
                  {review.recommended ? '✓ Recommended' : '✗ Not Recommended'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GamesPage;
