import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../styles/Home.css";  // Asegúrate de que el CSS está importado correctamente

const Home: React.FC = () => {
  const navigate = useNavigate();

  // Definir las imágenes para cada juego
  const images: Record<string, string[]> = {
    "The Witcher 3": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTradwvUgUAu2gmC-0-1ijboIWz2ayYU9lbLg&s",
    ],
    "Elden Ring": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrAgTgehIqQIYO-aqaNq3kE92YS_cIE57QnA&s",
    ],
    "Borderlands": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrhWz5dvYt_FD2k0KvELKFQWecENideIjHmw&s",
    ],
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images["The Witcher 3"].length);
  };

  const handlePrevious = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images["The Witcher 3"].length) % images["The Witcher 3"].length);
  };

  const handleFeaturedNext = () => {
    setCurrentFeaturedIndex((prevIndex) => (prevIndex + 1) % Object.keys(images).length);
  };

  const handleFeaturedPrevious = () => {
    setCurrentFeaturedIndex((prevIndex) => (prevIndex - 1 + Object.keys(images).length) % Object.keys(images).length);
  };

  const games = [
    { name: "The Witcher 3", route: "/witcher3" },
    { name: "Elden Ring", route: "/eldenring" },
    { name: "Borderlands", route: "/borderlands" },
  ];

  return (
    <div className="home-container">
      <Header />
      <main className="home-main">
        {/* Sección destacada para el juego seleccionado */}
        <section className="home-featured">
          <div className="home-catalog-item">
            <div className="home-image-container">
              <img
                src={images[games[currentFeaturedIndex].name][currentImageIndex]}
                alt={games[currentFeaturedIndex].name}
                className="home-image"
                onClick={() => navigate(games[currentFeaturedIndex].route)}
              />
            </div>
            <div className="home-buttons">
              <button onClick={handleFeaturedPrevious} className="home-button">Anterior</button>
              <button onClick={handleFeaturedNext} className="home-button">Siguiente</button>
            </div>
          </div>
        </section>

        {/* Catálogo general */}
        <section className="home-catalog">
          {games.map((game, index) => (
            <div key={index} className="home-catalog-item">
              <div className="home-image-container">
                <img
                  src={images[game.name][currentImageIndex]}
                  alt={game.name}
                  className="home-image"
                  onClick={() => navigate(game.route)}
                />
              </div>
              <div className="home-buttons">
                <button onClick={handlePrevious} className="home-button">Anterior</button>
                <button onClick={handleNext} className="home-button">Siguiente</button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Home;
