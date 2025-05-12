import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Header from "../components/HeaderComponent";
import "../styles/DownloadsPage.css";

const Downloads: React.FC = () => {
  const [games, setGames] = useState<any[]>([]);
  
  const fetchDownloads = useCallback(async () => {
  try {
    const token = localStorage.getItem("token");
    console.log("Token actual:", token);

    if (!token) {
      console.error("Usuario no autenticado.");
      return;
    }

    const response = await axios.get("http://localhost:3000/api/downloads", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    setGames(
      response.data.map((download: any) => ({
        id: download.idDownload,
        title: download.gameTitle || `Juego #${download.idGame}`,
        status: download.status,
        buttonLabel: download.status === "completed" ? "Play" : "Pause",
        cancelLabel: "Cancel",
      }))
    );

  } catch (error: unknown) { // 🔹 Asegura que el error sea de tipo desconocido
    if (axios.isAxiosError(error)) {
      console.error("Error al obtener descargas:", error.response?.data || error.message);
    } else {
      console.error("Error desconocido:", error);
    }
  }
}, []);


  useEffect(() => {
    fetchDownloads();
  }, [fetchDownloads]);

  const handlePrimaryButtonClick = (index: number) => {
    setGames(prevGames =>
      prevGames.map((game, i) =>
        i === index
          ? {
              ...game,
              status: game.status === "UPDATING" ? "PAUSED" : "UPDATING",
              buttonLabel: game.status === "UPDATING" ? "Resume" : "Pause",
            }
          : game
      )
    );
  };

  const handleCancelButtonClick = (index: number) => {
    setGames(prevGames =>
      prevGames.map((game, i) =>
        i === index ? { ...game, status: "CANCELLED", buttonLabel: "Download" } : game
      )
    );
  };

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

    setGames(prevGames => prevGames.filter((_, i) => i !== index));
  } catch (error: unknown) { // ✅ Define `error` como `unknown` para evitar problemas con TypeScript
    if (axios.isAxiosError(error)) {
      console.error("Error al eliminar la descarga:", error.response?.data || error.message);
    } else {
      console.error("Error desconocido:", error);
    }
  }
};


  useEffect(() => {
    const timer = setTimeout(() => {
      setGames(prevGames =>
        prevGames.map((game) =>
          game.status === "UPDATING" ? { ...game, status: "COMPLETED", buttonLabel: "Play" } : game
        )
      );
    }, 5000);

    return () => clearTimeout(timer);
  }, [games]);

  return (
    <div className="container">
      <Header />
      {games.length === 0 ? (
        <p className="no-games-message">No tienes juegos para descargar.</p>
      ) : (
        games.map((game, index) => (
          <div className="downloads" key={game.id || index}> {/* ✅ Corrección de `key` */}
            <h1>{game.title}</h1>
            <p><strong>CURRENT</strong> 12MBps</p>
            <p><strong>PEAK</strong> 48MBps</p>
            <p><strong>DISK</strong> 64MBps</p>
            <p>Tiempo restante: <strong>15 min</strong></p>
            <p><strong>{game.status}</strong></p>
            
            <button className="primary-button" onClick={() => handlePrimaryButtonClick(index)}>
              {game.buttonLabel}
            </button>

            {game.status === "UPDATING" && (
              <button className="cancel-button" onClick={() => handleCancelButtonClick(index)}>
                {game.cancelLabel}
              </button>
            )}
            
            {(game.status === "CANCELLED" || game.status === "COMPLETED") && (
              <button className="delete-button" onClick={() => handleDeleteButtonClick(index)}>
                Delete
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Downloads;
