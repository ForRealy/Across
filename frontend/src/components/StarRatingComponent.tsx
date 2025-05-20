import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import "../styles/StarRating.css";

interface StarRatingProps {
  rating: number; // rating out of 100
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  const scaledRating = rating / 20; // Convert to 5-star scale
  const fullStars = Math.floor(scaledRating);
  const hasHalfStar = scaledRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="star-rating">
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} className="star full" />
      ))}
      {hasHalfStar && <FaStarHalfAlt className="star half" />}
      {[...Array(emptyStars)].map((_, i) => (
        <FaRegStar key={`empty-${i}`} className="star empty" />
      ))}
      <span className="star-rating-number">{rating.toFixed(1)}/100</span>
    </div>
  );
};

export default StarRating;
