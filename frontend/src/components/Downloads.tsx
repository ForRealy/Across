import React, { useState, useEffect } from "react";
import Header from "./Header";
import "../assets/Downloads.css";

const Downloads: React.FC = () => {
  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    // Cargar los juegos comprados desde localStorage
    const purchasedGames = JSON.parse(localStorage.getItem("purchasedGames") || "[]");
    if (purchasedGames.length > 0) {
      setGames(
        purchasedGames.map((game: string) => ({
          name: game,
          status: "UPDATING", // Estado inicial de descarga
          buttonLabel: "Pause", // El botón inicial será "Pausar"
          cancelLabel: "Cancel", // El botón de cancelación estará disponible
        }))
      );
    }
  }, []);

  // Función para manejar clics en el botón principal (Pausar / Reanudar / Descargar)
  const handlePrimaryButtonClick = (index: number) => {
    setGames(prevGames =>
      prevGames.map((game, i) => {
        if (i === index) {
          if (game.buttonLabel === "Pause") {
            return { ...game, status: "PAUSED", buttonLabel: "Resume" };
          }
          else if (game.buttonLabel === "Resume") {
            return { ...game, status: "UPDATING", buttonLabel: "Pause" };
          }
          else if (game.buttonLabel === "Download") {
            return { ...game, status: "UPDATING", buttonLabel: "Pause" };
          }
        }
        return game;
      })
    );
  };

  // Función para manejar el botón de "Cancel"
  const handleCancelButtonClick = (index: number) => {
    setGames(prevGames =>
      prevGames.map((game, i) => {
        if (i === index) {
          return { ...game, status: "CANCELLED", buttonLabel: "Download"};
        }
        return game;
      })
    );
  };

  // Función para eliminar un juego de la lista
  const handleDeleteButtonClick = (index: number) => {
    const updatedGames = games.filter((_, i) => i !== index);
    setGames(updatedGames);

    // Actualizar el localStorage eliminando el juego
    const purchasedGames = JSON.parse(localStorage.getItem("purchasedGames") || "[]");
    purchasedGames.splice(index, 1);
    localStorage.setItem("purchasedGames", JSON.stringify(purchasedGames));
  };

  // Simular el cambio a "COMPLETED" después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setGames(prevGames =>
        prevGames.map((game) => {
          if (game.status === "UPDATING") {
            return {
              ...game,
              status: "COMPLETED",
              buttonLabel: "Play", // Cambiar el botón a "Play"
            };
          }
          return game;
        })
      );
    }, 5000); // 5000ms = 5 segundos

    return () => clearTimeout(timer); // Limpiar el temporizador al desmontar el componente
  }, [games]);

  return (
    <div className="container">
      <Header username="Player123" />
      {/* Verificamos si hay juegos para descargar */}
      {games.length === 0 ? (
        <p>No tienes juegos para descargar.</p>
      ) : (
        games.map((game, index) => (
          <div className="downloads" key={index}>
            <h1>{game.name}</h1>
            <p><strong>CURRENT</strong> 12MBps</p> {/* Ejemplo de velocidad actual */}
            <p><strong>PEAK</strong> 48MBps</p> {/* Ejemplo de velocidad máxima */}
            <p><strong>DISK</strong> 64MBps</p> {/* Ejemplo de velocidad de disco */}
            <p>Tiempo restante: <strong>15 min</strong></p> {/* Ejemplo de tiempo restante */}
            <p><strong>{game.status}</strong></p> {/* Mostrar el estado de la descarga */}
            
            {/* Botones para controlar la descarga */}
            <button onClick={() => handlePrimaryButtonClick(index)}>{game.buttonLabel}</button>

            {/* Mostrar botón de cancelación solo si el estado es "UPDATING" */}
            {game.status === "UPDATING" && (
              <button onClick={() => handleCancelButtonClick(index)}>{game.cancelLabel}</button>
            )}
            
            {/* Botón Eliminar para juegos que están cancelados o completados */}
            {game.status === "CANCELLED" || game.status === "COMPLETED" ? (
              <button onClick={() => handleDeleteButtonClick(index)}>Delete</button>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
};

export default Downloads;
