import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/HeaderComponent";
import "../styles/HomePage.css";
import axios from "axios";

interface Game {
  title: string;
  cover: string;
  sliderImage: string;
  rating?: number;
  releaseDate?: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [popularGames, setPopularGames] = useState<Game[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const [popularResponse, upcomingResponse] = await Promise.all([
          axios.get("http://localhost:3000/api/games/popular"),
          axios.get("http://localhost:3000/api/games/upcoming")
        ]);
        setPopularGames(popularResponse.data);
        setUpcomingGames(upcomingResponse.data);
      } catch (error) {
        console.error("Error al cargar juegos:", error);
      }
    };

    loadGames();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % popularGames.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [popularGames.length]);

  return (
    <div>
      <Header />
      <main className="home-main">
        {/* Sección Popular Right Now */}
        <section className="popular-section">
          <h2 className="section-title">Popular Right Now</h2>
          <div className="popular-slider">
            {popularGames.length > 0 && (
              <div className="slider-container" onClick={() => navigate(`/game/${popularGames[currentSlide].title}`)}>
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

        {/* Sección Próximos Lanzamientos */}
        <section className="upcoming-section">
          <h2 className="section-title">Próximos Lanzamientos</h2>
          <div className="upcoming-games">
            {upcomingGames.map((game, index) => (
              <div key={index} className="upcoming-game-card" onClick={() => navigate(`/game/${game.title}`)}>
                <img
                  src={game.cover}
                  alt={game.title}
                  className="upcoming-game-image"
                />
                <div className="upcoming-game-info">
                  <h3>{game.title}</h3>
                  <p>Lanzamiento: {game.releaseDate}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
