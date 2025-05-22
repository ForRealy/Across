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

const StarRating: React.FC<{ rating: number; onRate: (rate: number) => void }> = ({ rating, onRate }) => {
  return (
    <div className="library-star-filter" style={{ cursor: "pointer" }}>
      {[5, 4, 3, 2, 1].map((star) => (
        <span
          key={star}
          onClick={() => onRate(star)}
          className={`clickable-star ${rating >= star ? "active" : ""}`}
          style={{ fontSize: "20px", color: rating >= star ? "#f5b50a" : "#ccc" }}
          role="button"
          aria-label={`${star} stars`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const ReviewComponent: React.FC<ReviewComponentProps> = ({ gameId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewType, setReviewType] = useState("Positive");
  const [description, setDescription] = useState("");
  const [recommended, setRecommended] = useState(true);
  const [userRatings, setUserRatings] = useState<Record<number, number>>({});

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/games/${gameId}/reviews`);
        setReviews(response.data);

        if (token) {
          const ratingsPromises = response.data.map(async (review: Review) => {
            try {
              const res = await axios.get(
                `http://localhost:3000/api/reviews/${review.idReview}/rating`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              return { idReview: review.idReview, rating: res.data.rating || 0 };
            } catch (err) {
              console.log(`Error fetching rating for review ${review.idReview}`, err);
              return { idReview: review.idReview, rating: 0 };
            }
          });

          const ratings = await Promise.all(ratingsPromises);
          const ratingsMap: Record<number, number> = {};
          ratings.forEach(({ idReview, rating }) => {
            ratingsMap[idReview] = rating;
          });
          setUserRatings(ratingsMap);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [gameId, token]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Please write a review description.");
      return;
    }

    if (!token) {
      alert("You must be logged in to submit a review");
      return;
    }

    try {
      await axios.post(
        `http://localhost:3000/api/games/${gameId}/reviews`,
        { review_type: reviewType, description, recommended },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      const refreshed = await axios.get<Review[]>(`http://localhost:3000/api/games/${gameId}/reviews`);
      setReviews(refreshed.data);
      alert("Review submitted successfully!");

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

  const handleRatingChange = async (idReview: number, rating: number) => {
    if (!token) {
      alert("You must be logged in to rate a review");
      return;
    }

    try {
      await axios.post(
        `http://localhost:3000/api/reviews/${idReview}/rating`,
        { rating },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      setUserRatings((prev) => ({ ...prev, [idReview]: rating }));
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Error submitting rating");
    }
  };

  return (
    <div className="gamepage-reviews-section">
      <h2>Reviews</h2>

      <form className="review-form" onSubmit={handleReviewSubmit}>
        <h3>Write a Review</h3>

        <label>
          Review Type:
          <br />
          <select value={reviewType} onChange={(e) => setReviewType(e.target.value)}>
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

        <button type="submit" className="btn-submit-review">Submit Review</button>
      </form>

      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review.idReview} className="review-card">
            <div className="review-header">
              <span className="review-author">{review.profile_name || "Anonymous"}</span>
              <span className={`review-type ${review.review_type}`}>{review.review_type}</span>
            </div>
            <p className="review-description">{review.description}</p>

            <div className="review-footer">
              <StarRating
                rating={userRatings[review.idReview] || 0}
                onRate={(rating) => handleRatingChange(review.idReview, rating)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewComponent;
