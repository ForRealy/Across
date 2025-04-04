import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { userAuth } from "./AuthContext";
import "../assets/Home.css";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = userAuth(); 
  const [cart, setCart] = useState<string[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  const imagesEldenRing = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrhWz5dvYt_FD2k0KvELKFQWecENideIjHmw&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrAgTgehIqQIYO-aqaNq3kE92YS_cIE57QnA&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTradwvUgUAu2gmC-0-1ijboIWz2ayYU9lbLg&s",
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imagesEldenRing.length);
  };

  const handlePrevious = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imagesEldenRing.length) % imagesEldenRing.length);
  };

  const games = [
    { name: "Elden Ring", route: "/eldenring" },
    { name: "God of War", route: "/godofwar" },
    { name: "Cyberpunk 2077", route: "/cyberpunk" },
    { name: "Hollow Knight", route: "/hollowknight" },
  ];

  return (
    <div className="home-container">
      <Header />
      <main className="home-main">
        <section className="home-catalog">
          {games.map((game, index) => (
            <div key={index} className="home-catalog-item">
              <div className="home-image-container">
                <img
                  src={imagesEldenRing[currentImageIndex]}
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
