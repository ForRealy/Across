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
  const [downloadControllers, setDownloadControllers] = useState<{ [key: number]: AbortController }>({});

  const simulateDownload = (gameId: number) => {
    if (downloadIntervals[gameId]) {
      clearInterval(downloadIntervals[gameId]);
    }
    setDownloadProgress(prev => ({ ...prev, [gameId]: 0 }));

    const interval = window.setInterval(() => {
      setDownloadProgress(prev => {
        const newProgress = prev[gameId] + Math.random() * 5;
        if (newProgress >= 100) {
          clearInterval(interval);
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

    setDownloadIntervals(prev => ({ ...prev, [gameId]: interval }));
  };

  const cancelDownload = (gameId: number) => {
    // Abort the HTTP request
    const controller = downloadControllers[gameId];
    if (controller) {
      controller.abort();
      setDownloadControllers(prev => {
        const c = { ...prev };
        delete c[gameId];
        return c;
      });
    }

    // Clear simulated progress
    if (downloadIntervals[gameId]) {
      clearInterval(downloadIntervals[gameId]);
      setDownloadIntervals(prev => {
        const ints = { ...prev };
        delete ints[gameId];
        return ints;
      });
    }

    // Remove progress UI
    setDownloadProgress(prev => {
      const prog = { ...prev };
      delete prog[gameId];
      return prog;
    });

    // Reset status & label
    setGames(prev =>
      prev.map(g =>
        g.id === gameId
          ? { ...g, status: "pending", buttonLabel: "Download" }
          : g
      )
    );
  };

  const fetchDownloads = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuario no autenticado.");
        return;
      }

      const response = await axios.get("http://localhost:3000/api/downloads", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const gamesWithDetails = await Promise.all(
        response.data.map(async (download: Download) => {
          const normalizedStatus = download.status.toLowerCase() as Game['status'];
          try {
            const gameRes = await axios.get(
              `http://localhost:3000/api/games/details/${download.idGame}`,
              {
                withCredentials: true,
                params: { includeCover: true },
              }
            );
            return {
              id: download.idDownload,
              gameId: download.idGame,
              title: gameRes.data.title,
              cover: gameRes.data.cover,
              status: normalizedStatus,
              buttonLabel: normalizedStatus === "completed" ? "Play" : "Download",
              cancelLabel: "Cancel",
            };
          } catch {
            return {
              id: download.idDownload,
              gameId: download.idGame,
              title: `Juego #${download.idGame}`,
              cover: "",
              status: normalizedStatus,
              buttonLabel: normalizedStatus === "completed" ? "Play" : "Download",
              cancelLabel: "Cancel",
            };
          }
        })
      );

      setGames(gamesWithDetails);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Error al obtener descargas:", err.response?.data || err.message);
      } else {
        console.error("Error desconocido:", err);
      }
    }
  }, []);

  useEffect(() => {
    fetchDownloads();
  }, [fetchDownloads]);

  const handlePrimaryButtonClick = (index: number) => {
    const game = games[index];
    if (game.status === "completed") {
      console.log("Playing game:", game.title);
      return;
    }

    // Mark as downloading
    setGames(prev =>
      prev.map((g, i) =>
        i === index ? { ...g, status: "downloading", buttonLabel: "Cancel" } : g
      )
    );

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Usuario no autenticado.");
      return;
    }

    // Setup AbortController
    const controller = new AbortController();
    setDownloadControllers(prev => ({ ...prev, [game.id]: controller }));

    // Create download link
    const link = document.createElement("a");
    link.href = `http://localhost:3000/api/downloads/file/${game.gameId}`;
    link.setAttribute("download", `game-${game.gameId}.iso`);

    const headers = new Headers();
    headers.append("Authorization", `Bearer ${token}`);

    fetch(link.href, {
      headers,
      credentials: "include",
      signal: controller.signal,
    })
      .then(res => {
        if (!res.ok) throw new Error("Download failed");
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.click();
        window.URL.revokeObjectURL(url);
        setGames(prev =>
          prev.map((g, i) =>
            i === index ? { ...g, status: "completed", buttonLabel: "Play" } : g
          )
        );
      })
      .catch(error => {
        if ((error as any).name === "AbortError") {
          console.log("Download aborted by user");
          return;
        }
        console.error("Error downloading file:", error);
        setGames(prev =>
          prev.map((g, i) =>
            i === index ? { ...g, status: "failed", buttonLabel: "Retry" } : g
          )
        );
      });

    simulateDownload(game.id);
  };

  const handleDeleteButtonClick = async (index: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.delete(
        `http://localhost:3000/api/downloads/${games[index].id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGames(prev => prev.filter((_, i) => i !== index));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Error al eliminar la descarga:", err.response?.data || err.message);
      } else {
        console.error("Error desconocido:", err);
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
            {game.cover && <img src={game.cover} alt={game.title} className="game-cover" />}
            <div className="download-info">
              <h1>{game.title}</h1>
              <div className="download-status">
                <p>
                  Estado: <strong className={`status-${game.status}`}>{game.status}</strong>
                </p>
                {game.status === "downloading" && (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${downloadProgress[game.id] || 0}%` }}
                    />
                    <span className="progress-text">
                      {Math.round(downloadProgress[game.id] || 0)}%
                    </span>
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
                    onClick={() => cancelDownload(game.id)}
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
