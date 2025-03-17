import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import Header from "./Header";

const Home: React.FC = () => {
    const navigate = useNavigate(); // Inicializar useNavigate
    
    const images = [
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSS_FQTWLlPuRltYTU22XBavXv1jzcDuKY4KA&s",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSS_FQTWLlPuRltYTU22XBavXv1jzcDuKY4KA&s",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSS_FQTWLlPuRltYTU22XBavXv1jzcDuKY4KA&s",
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

    const styles: { 
        main: React.CSSProperties; 
        catalog: React.CSSProperties; 
        container: React.CSSProperties;
        imageContainer: React.CSSProperties;
        image: React.CSSProperties;
        button: React.CSSProperties;
    } = {
        container: {
            height: "100vh", // Hacemos que el fondo ocupe toda la altura de la pantalla
            width: "100vh", // Asegura que el contenedor ocupe todo el ancho
            display: "flex",
            flexDirection: "column", // Los elementos dentro se apilan verticalmente
            backgroundColor: "#600000", // Fondo granate más oscuro
        },
        main: {
            flex: 1, // Hace que el main ocupe todo el espacio disponible
            padding: "20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center", // Centra el contenido verticalmente
        },
    catalog: {
      marginTop: "20px", // Espaciado entre el texto y el catálogo
    },
    imageContainer: {
      marginBottom: "20px",
    },
    image: {
      width: "300px", // Tamaño de la imagen
      height: "200px",
      objectFit: "cover", // Asegura que la imagen se ajuste bien
    },
    button: {
      margin: "10px",
      padding: "10px 20px",
      backgroundColor: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      color: "black",
    },
  };

  return (
    <div style={styles.container}>
      <Header username="Player123" />
      
      <main style={styles.main}>
       {/* primer juego */}
       <section style={styles.catalog}>
          <div style={styles.imageContainer}>
            <img
              src={images[currentImageIndex]}
              alt="Juego"
              style={styles.image}
              onClick={() => navigate("/game")}            
            />
          </div>

          <div>
            <button onClick={handlePrevious} style={styles.button}>
              Anterior
            </button>
            <button onClick={handleNext} style={styles.button}>
              Siguiente
            </button>
          </div>
        </section>

        {/* segundo juego */}
        <section style={styles.catalog}>
          <div style={styles.imageContainer}>
            <img
              src={images[currentImageIndex]}
              alt="Juego"
              style={styles.image}
              onClick={() => navigate("/game")}            
              />
          </div>

          <div>
            <button onClick={handlePrevious} style={styles.button}>
              Anterior
            </button>
            <button onClick={handleNext} style={styles.button}>
              Siguiente
            </button>
          </div>
        </section>

        {/* tercer juego */}
        <section style={styles.catalog}>
          <div style={styles.imageContainer}>
            <img
              src={images[currentImageIndex]}
              alt="Juego"
              style={styles.image}
              onClick={() => navigate("/game")}            
              />
          </div>

          <div>
            <button onClick={handlePrevious} style={styles.button}>
              Anterior
            </button>
            <button onClick={handleNext} style={styles.button}>
              Siguiente
            </button>
          </div>
        </section>

        {/* cuarto juego */}
        <section style={styles.catalog}>
          <div style={styles.imageContainer}>
            <img
              src={images[currentImageIndex]}
              alt="Juego"
              style={styles.image}
              onClick={() => navigate("/game")}            
              />
          </div>

          <div>
            <button onClick={handlePrevious} style={styles.button}>
              Anterior
            </button>
            <button onClick={handleNext} style={styles.button}>
              Siguiente
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
