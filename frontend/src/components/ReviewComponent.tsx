// src/components/ReviewComponent.tsx
import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import "../styles/ReviewComponent.css";

interface Review {
  idReview: number;
  idUser: number;
  review_type: string;
  description: string;
  recommended: boolean;
  profile_name?: string;
}

interface ReviewComponentProps {
  gameId: string;
}

const ReviewComponent: React.FC<ReviewComponentProps> = ({ gameId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewType, setReviewType] = useState("Positive");
  const [description, setDescription] = useState("");
  const [recommended, setRecommended] = useState(true);

  // Fetch reviews when the component loads or when gameId changes
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get<Review[]>(
          `http://localhost:3000/api/games/${gameId}/reviews`
        );
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [gameId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Please write a review description.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to submit a review");
        return;
      }

      await axios.post(
        `http://localhost:3000/api/games/${gameId}/reviews`,
        {
          review_type: reviewType,
          description,
          recommended,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Refresh reviews after submission
      const refreshed = await axios.get<Review[]>(
        `http://localhost:3000/api/games/${gameId}/reviews`
      );
      setReviews(refreshed.data);
      alert("Review submitted successfully!");

      // Reset form
      setReviewType("Positive");
      setDescription("");
      setRecommended(true);
    } catch (error) {
      console.error("Error submitting review:", error);
      if (error instanceof AxiosError) {
        alert(error.response?.data?.message || "Error submitting review");
      } else {
        alert("Unexpected error occurred");
      }
    }
  };

  return (
    <div className="gamepage-reviews-section">
      <h2>Reviews</h2>

      {/* Review Form */}
      <form className="review-form" onSubmit={handleReviewSubmit}>
        <h3>Write a Review</h3>

        <label>
          Review Type:
          <br></br>
          <select
            value={reviewType}
            onChange={(e) => setReviewType(e.target.value)}
          >
            <option value="Positive">Positive</option>
            <option value="Negative">Negative</option>
          </select>
        </label>

        <label>
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="What did you think about this game?"
          />
        </label>

        <label>
          <input
            type="checkbox"
            checked={recommended}
            onChange={(e) => setRecommended(e.target.checked)}
          />
          Recommend this game
        </label>

        <button type="submit" className="btn-submit-review">
          Submit Review
        </button>
      </form>

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review.idReview} className="review-card">
            <div className="review-header">
              <span className="review-author">
                {review.profile_name || "Anonymous"}
              </span>
              <span className={`review-type ${review.review_type}`}>
                {review.review_type}
              </span>
            </div>
            <p className="review-description">{review.description}</p>
            <div className="review-footer">
              <span className="review-recommendation">
                {review.recommended ? "✓ Recommended" : "✗ Not Recommended"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewComponent;
