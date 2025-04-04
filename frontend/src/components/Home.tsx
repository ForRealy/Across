import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { userAuth } from "./AuthContext";
import "../assets/Home.css";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = userAuth(); 
    const [cart, setCart] = useState<string[]>([]);

  // Cargar el carrito desde localStorage cuando se monta el componente
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart)); // Si hay carrito guardado, cargarlo
    }
  }, []);

  // Guardar el carrito en localStorage cada vez que cambia
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
    <div className="container">
      {/* Header con el nombre del usuario autenticado */}
      <Header />

      <main className="main">
        {games.map((game, index) => (
          <section key={index} className="catalog">
            <div className="imageContainer">
              <img
                src={imagesEldenRing[currentImageIndex]}
                alt={game.name}
                className="image"
                onClick={() => navigate(game.route)}
              />
            </div>

            <div>
              <button onClick={handlePrevious} className="button">Anterior</button>
              <button onClick={handleNext} className="button">Siguiente</button>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};

export default Home;
