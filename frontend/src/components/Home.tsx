import React from "react";
import Header from "./Header";

// Definimos el tipo de estilos como React.CSSProperties
const Home: React.FC = () => {
  // Aseguramos que 'styles' es de tipo 'React.CSSProperties'
  const styles: { main: React.CSSProperties; catalog: React.CSSProperties } = {
    main: {
      padding: "20px",
      textAlign: "center", // Ahora TypeScript lo acepta correctamente
    },
    catalog: {
      marginTop: "20px",
    },
  };

  return (
    <div>
      {/* Incluir el Header */}
      <Header username="Player123" />
      
      {/* Main content */}
      <main style={styles.main}>
        <h2>Bienvenido a la tienda de videojuegos</h2>
        <p>Explora los últimos juegos y haz tus compras ahora.</p>

        {/* Ejemplo de catálogo */}
        <section style={styles.catalog}>
          <h3>Catálogo de Juegos</h3>
          <ul>
            <li>Juego 1</li>
            <li>Juego 2</li>
            <li>Juego 3</li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default Home;
