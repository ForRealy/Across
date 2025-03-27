import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import '../assets/Home.css'; // Importar el archivo CSS

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<string[]>([]);

  // Cargar el carrito desde localStorage cuando se monta el componente
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart)); // Si hay carrito guardado, cargarlo
    }
  }, []); // Se ejecuta una vez cuando el componente se monta

  // Guardar el carrito en localStorage cada vez que cambia
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart)); // Guardar el carrito
    }
  }, [cart]); // Se ejecuta cada vez que el carrito cambia

  const imagesEldenRing = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrhWz5dvYt_FD2k0KvELKFQWecENideIjHmw&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrAgTgehIqQIYO-aqaNq3kE92YS_cIE57QnA&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTradwvUgUAu2gmC-0-1ijboIWz2ayYU9lbLg&s",
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleNext = () => {
    if (currentImageIndex < imagesEldenRing.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return (
    <div className="container">
      <Header username="Player123" />
      
      <main className="main">
        {/* Primer juego */}
        <section className="catalog">
          <div className="imageContainer">
            <img
              src={imagesEldenRing[currentImageIndex]}
              alt="Juego"
              className="image"
              onClick={() => navigate("/EldenRing")}            
            />
          </div>

          <div>
            <button onClick={handlePrevious} className="button">
              Anterior
            </button>
            <button onClick={handleNext} className="button">
              Siguiente
            </button>
          </div>
        </section>

        {/* Segundo juego */}
        <section className="catalog">
          <div className="imageContainer">
            <img
              src={imagesEldenRing[currentImageIndex]}
              alt="Juego"
              className="image"
              onClick={() => navigate("/home")}            
            />
          </div>

          <div>
            <button onClick={handlePrevious} className="button">
              Anterior
            </button>
            <button onClick={handleNext} className="button">
              Siguiente
            </button>
          </div>
        </section>

        {/* Tercer juego */}
        <section className="catalog">
          <div className="imageContainer">
            <img
              src={imagesEldenRing[currentImageIndex]}
              alt="Juego"
              className="image"
              onClick={() => navigate("/home")}            
            />
          </div>

          <div>
            <button onClick={handlePrevious} className="button">
              Anterior
            </button>
            <button onClick={handleNext} className="button">
              Siguiente
            </button>
          </div>
        </section>

        {/* Cuarto juego */}
        <section className="catalog">
          <div className="imageContainer">
            <img
              src={imagesEldenRing[currentImageIndex]}
              alt="Juego"
              className="image"
              onClick={() => navigate("/home")}            
            />
          </div>

          <div>
            <button onClick={handlePrevious} className="button">
              Anterior
            </button>
            <button onClick={handleNext} className="button">
              Siguiente
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
