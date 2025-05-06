import React from "react";
import { useNavigate } from "react-router-dom";

interface Game {
  id: number;
  title: string;
  cover: string;
  sliderImage: string;
  rating?: number;
}

interface PopularGamesProps {
  popularGames: Game[];
  currentSlide: number;
  setCurrentSlide: React.Dispatch<React.SetStateAction<number>>;
}

const PopularGames: React.FC<PopularGamesProps> = ({ popularGames, currentSlide, setCurrentSlide }) => {
  const navigate = useNavigate();

  return (
    <section className="popular-section">
      <h2 className="section-title">Popular Right Now</h2>
      <div className="popular-slider">
        {popularGames.length > 0 && (
          <div
            className="slider-container"
            onClick={() => {
              // ✅ Navegar usando el ID del juego actual
              const gameId = popularGames[currentSlide].id;
              navigate(`/details/${gameId}`);
            }}
          >
            <img
              src={popularGames[currentSlide].sliderImage}
              alt={popularGames[currentSlide].title}
              className="slider-image"
            />
            <div className="slider-info">
              <h3>{popularGames[currentSlide].title}</h3>
              <p>Rating: {popularGames[currentSlide].rating?.toFixed(1)}/100</p>
            </div>
          </div>
        )}
      </div>
      <div className="popular-thumbnails">
        {popularGames.map((game, index) => (
          <div
            key={index}
            className={`thumbnail ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          >
            <img src={game.cover} alt={game.title} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularGames;