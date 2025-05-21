import React from "react";

interface StarRatingFilterProps {
  minStarRating: number;
  setMinStarRating: (rating: number) => void;
}

const StarRatingFilter: React.FC<StarRatingFilterProps> = ({
  minStarRating,
  setMinStarRating,
}) => {
  return (
    <div className="library-filter-group">
      <h3>Filtrar por estrellas</h3>
      <div className="library-star-filter">
        {[5, 4, 3, 2, 1].map((star) => (
          <span
            key={star}
            onClick={() =>
              setMinStarRating(minStarRating === star ? 0 : star)
            }
            className={`clickable-star ${
              minStarRating >= star ? "active" : ""
            }`}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
};

export default StarRatingFilter;
