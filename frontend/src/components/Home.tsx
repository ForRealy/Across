import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Header from "./Header";
import '../assets/Home.css'; // Importar el archivo CSS

const Home: React.FC = () => {

    const navigate = useNavigate();


  const images = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrhWz5dvYt_FD2k0KvELKFQWecENideIjHmw&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrAgTgehIqQIYO-aqaNq3kE92YS_cIE57QnA&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTradwvUgUAu2gmC-0-1ijboIWz2ayYU9lbLg&s",
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleNext = () => {
    // Avanza a la siguiente imagen
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevious = () => {
    // Retrocede a la imagen anterior
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
              src={images[currentImageIndex]}
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
              src={images[currentImageIndex]}
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
              src={images[currentImageIndex]}
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
              src={images[currentImageIndex]}
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
