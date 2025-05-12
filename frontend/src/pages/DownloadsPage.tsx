import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/HeaderComponent";
import "../styles/DownloadsPage.css";

const Downloads: React.FC = () => {
  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
  const fetchDownloads = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Usuario no autenticado.");
      return;
    }

    const response = await axios.get("http://localhost:3000/api/downloads", {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Aquí debe estar el token
      },
      withCredentials: true, // ✅ Envía las cookies de sesión si es necesario
    });

    setGames(response.data);
  } catch (error) {
    console.error("Error al obtener descargas:", error);
    }
  };

  fetchDownloads();
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
  const handleDeleteButtonClick = async (index: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuario no autenticado.");
        return;
      }

      await axios.delete(`http://localhost:3000/api/downloads/${games[index].id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedGames = games.filter((_, i) => i !== index);
      setGames(updatedGames);
    } catch (error) {
      console.error("Error al eliminar la descarga:", error);
    }
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
      <Header />
      {/* Verificamos si hay juegos para descargar */}
      {games.length === 0 ? (
        <p className="no-games-message">No tienes juegos para descargar.</p>
      ) : (
        games.map((game, index) => (
          <div className="downloads" key={game.id}>
            <h1>{game.name}</h1>
            <p><strong>CURRENT</strong> 12MBps</p> {/* Ejemplo de velocidad actual */}
            <p><strong>PEAK</strong> 48MBps</p> {/* Ejemplo de velocidad máxima */}
            <p><strong>DISK</strong> 64MBps</p> {/* Ejemplo de velocidad de disco */}
            <p>Tiempo restante: <strong>15 min</strong></p> {/* Ejemplo de tiempo restante */}
            <p><strong>{game.status}</strong></p> {/* Mostrar el estado de la descarga */}
            
            {/* Botones para controlar la descarga */}
            <button
              className="primary-button"
              onClick={() => handlePrimaryButtonClick(index)}
            >
              {game.buttonLabel}
            </button>

            {/* Mostrar botón de cancelación solo si el estado es "UPDATING" */}
            {game.status === "UPDATING" && (
              <button
                className="cancel-button"
                onClick={() => handleCancelButtonClick(index)}
              >
                {game.cancelLabel}
              </button>
            )}
            
            {/* Botón Eliminar para juegos que están cancelados o completados */}
            {game.status === "CANCELLED" || game.status === "COMPLETED" ? (
              <button
                className="delete-button"
                onClick={() => handleDeleteButtonClick(index)}
              >
                Delete
              </button>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
};

export default Downloads;
