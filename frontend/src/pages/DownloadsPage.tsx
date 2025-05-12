import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Header from "../components/HeaderComponent";
import "../styles/DownloadsPage.css";

// Add NodeJS type
declare global {
  namespace NodeJS {
    interface Timeout {}
  }
}

interface Game {
  id: number;
  gameId: number;
  title: string;
  cover: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  buttonLabel: string;
  cancelLabel: string;
  progress?: number;
}

interface Download {
  idDownload: number;
  idGame: number;
  status: string;
}

const Downloads: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<{ [key: number]: number }>({});
  const [downloadIntervals, setDownloadIntervals] = useState<{ [key: number]: number }>({});

  const simulateDownload = (gameId: number) => {
    // Clear any existing interval for this game
    if (downloadIntervals[gameId]) {
      clearInterval(downloadIntervals[gameId]);
    }

    // Start progress at 0
    setDownloadProgress(prev => ({ ...prev, [gameId]: 0 }));

    // Simulate download progress
    const interval = window.setInterval(() => {
      setDownloadProgress(prev => {
        const newProgress = prev[gameId] + Math.random() * 5; // Random progress between 0-5%
        if (newProgress >= 100) {
          clearInterval(interval);
          // Update game status to completed
          setGames(prevGames =>
            prevGames.map(game =>
              game.id === gameId
                ? { ...game, status: "completed", buttonLabel: "Play" }
                : game
            )
          );
          return { ...prev, [gameId]: 100 };
        }
        return { ...prev, [gameId]: newProgress };
      });
    }, 1000);

    // Store the interval ID
    setDownloadIntervals(prev => ({ ...prev, [gameId]: interval }));
  };

  const cancelDownload = (gameId: number) => {
    if (downloadIntervals[gameId]) {
      clearInterval(downloadIntervals[gameId]);
      setDownloadIntervals(prev => {
        const newIntervals = { ...prev };
        delete newIntervals[gameId];
        return newIntervals;
      });
    }
    setDownloadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[gameId];
      return newProgress;
    });
  };
  
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

      const gamesWithDetails = await Promise.all(
        response.data.map(async (download: Download) => {
          try {
            const gameResponse = await axios.get(`http://localhost:3000/api/games/details/${download.idGame}`, {
              withCredentials: true,
              params: {
                includeCover: true
              }
            });

            return {
              id: download.idDownload,
              gameId: download.idGame,
              title: gameResponse.data.title,
              cover: gameResponse.data.cover,
              status: download.status,
              buttonLabel: download.status === "COMPLETED" ? "Play" : "Download",
              cancelLabel: "Cancel",
            };
          } catch (error) {
            console.error(`Error fetching details for game ${download.idGame}:`, error);
            return {
        id: download.idDownload,
              gameId: download.idGame,
              title: `Juego #${download.idGame}`,
              cover: "",
        status: download.status,
              buttonLabel: download.status === "COMPLETED" ? "Play" : "Download",
        cancelLabel: "Cancel",
            };
          }
        })
    );

      setGames(gamesWithDetails);
    } catch (error: unknown) {
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
    const game = games[index];
    if (game.status === "completed") {
      // Handle play action
      console.log("Playing game:", game.title);
    } else {
      // Start download
    setGames(prevGames =>
        prevGames.map((g, i) =>
        i === index
            ? { ...g, status: "downloading", buttonLabel: "Cancel" }
            : g
        )
      );
      
      // Start the actual download
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuario no autenticado.");
        return;
      }

      // Create a hidden link to trigger the download
      const link = document.createElement('a');
      link.href = `http://localhost:3000/api/downloads/file/${game.gameId}`;
      link.setAttribute('download', `game-${game.gameId}.iso`);
      
      // Add authorization header
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${token}`);
      
      // Start the download
      fetch(link.href, {
        headers: headers,
        credentials: 'include'
      })
      .then(response => {
        if (!response.ok) throw new Error('Download failed');
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.click();
        window.URL.revokeObjectURL(url);
        
        // Update status to completed
        setGames(prevGames =>
          prevGames.map((g, i) =>
            i === index
              ? { ...g, status: "completed", buttonLabel: "Play" }
              : g
          )
        );
      })
      .catch(error => {
        console.error('Error downloading file:', error);
        // Update status to failed
        setGames(prevGames =>
          prevGames.map((g, i) =>
            i === index
              ? { ...g, status: "failed", buttonLabel: "Retry" }
              : g
      )
    );
      });

      // Simulate progress while downloading
      simulateDownload(game.id);
    }
  };

  const handleCancelButtonClick = (index: number) => {
    const game = games[index];
    cancelDownload(game.id);
    setGames(prevGames =>
      prevGames.map((g, i) =>
        i === index
          ? { ...g, status: "pending", buttonLabel: "Download" }
          : g
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
    } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Error al eliminar la descarga:", error.response?.data || error.message);
    } else {
      console.error("Error desconocido:", error);
    }
  }
};

  return (
    <div className="container">
      <Header />
      {games.length === 0 ? (
        <p className="no-games-message">No tienes juegos para descargar.</p>
      ) : (
        games.map((game, index) => (
          <div className="downloads" key={game.id}>
            {game.cover && (
              <img src={game.cover} alt={game.title} className="game-cover" />
            )}
            <div className="download-info">
            <h1>{game.title}</h1>
              
              <div className="download-status">
                <p>Estado: <strong className={`status-${game.status}`}>{game.status}</strong></p>
                {game.status === "downloading" && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${downloadProgress[game.id] || 0}%` }}
                    />
                    <span className="progress-text">{Math.round(downloadProgress[game.id] || 0)}%</span>
                  </div>
                )}
              </div>

              <div className="button-group">
                <button 
                  className="primary-button" 
                  onClick={() => handlePrimaryButtonClick(index)}
                >
              {game.buttonLabel}
            </button>

            {game.status === "downloading" && (
                  <button 
                    className="cancel-button" 
                    onClick={() => handleCancelButtonClick(index)}
                  >
                {game.cancelLabel}
              </button>
            )}
            
            {(game.status === "pending" || game.status === "completed") && (
                  <button 
                    className="delete-button" 
                    onClick={() => handleDeleteButtonClick(index)}
                  >
                Delete
              </button>
            )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Downloads;
