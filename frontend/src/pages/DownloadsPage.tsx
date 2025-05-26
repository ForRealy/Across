import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/HeaderComponent";
import Spinner from "../components/Spinner";  // Import Spinner
import axios from "axios";
import "../styles/DownloadsPage.css";

interface Game {
  id: number;
  gameId: number;
  title: string;
  cover: string;
  status: 'Pending' | 'Downloading' | 'Completed' | 'Failed';
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
  const [loading, setLoading] = useState(true); // Loading state
  const [downloadControllers, setDownloadControllers] = useState<{
    [key: number]: AbortController
  }>({});

  const fetchDownloads = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Usuario no autenticado.");

      const response = await axios.get<Download[]>(
        "http://localhost:3000/api/downloads",
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      const gamesWithDetails = await Promise.all(
        response.data.map(async (download) => {
          let status: Game['status'] = 'Pending';
          switch (download.status.toLowerCase()) {
            case 'completed': status = 'Completed'; break;
            case 'downloading': status = 'Downloading'; break;
            case 'failed': status = 'Failed'; break;
            default: status = 'Pending';
          }
          try {
            const res = await axios.get(
              `http://localhost:3000/api/games/details/${download.idGame}`,
              { withCredentials: true, params: { includeCover: true } }
            );
            return {
              id: download.idDownload,
              gameId: download.idGame,
              title: res.data.title,
              cover: res.data.cover,
              status,
              buttonLabel: status === 'Completed' ? 'Play' : 'Download',
              cancelLabel: 'Cancel',
            };
          } catch {
            return {
              id: download.idDownload,
              gameId: download.idGame,
              title: `Juego #${download.idGame}`,
              cover: '',
              status,
              buttonLabel: status === 'Completed' ? 'Play' : 'Download',
              cancelLabel: 'Cancel',
            };
          }
        })
      );

      setGames(gamesWithDetails);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDownloads();
  }, [fetchDownloads]);

  const cancelDownload = (gameId: number) => {
    const controller = downloadControllers[gameId];
    controller?.abort();
    setDownloadControllers(prev => {
      const copy = { ...prev };
      delete copy[gameId];
      return copy;
    });
    setGames(prev => prev.map(g =>
      g.id === gameId ? { ...g, status: 'Pending', buttonLabel: 'Download' } : g
    ));
  };

  const handlePrimaryButtonClick = (index: number) => {
    const game = games[index];
    if (game.status === 'Completed') {
      console.log('Playing game:', game.title);
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setGames(prev => prev.map((g, i) =>
        i === index ? { ...g, status: 'Failed', buttonLabel: 'Retry' } : g
      ));
      return;
    }
    setGames(prev => prev.map((g, i) =>
      i === index ? { ...g, status: 'Downloading', buttonLabel: '' } : g
    ));
    const controller = new AbortController();
    setDownloadControllers(prev => ({ ...prev, [game.id]: controller }));

    fetch(`http://localhost:3000/api/downloads/file/${game.gameId}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async response => {
        if (!response.ok) throw new Error('Download failed');
        const contentDisp = response.headers.get('content-disposition');
        const filename = contentDisp
          ? contentDisp.split('filename=')[1].replace(/"/g, '')
          : `${game.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.iso`;
        return { blob: await response.blob(), filename };
      })
      .then(({ blob, filename }) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setGames(prev => prev.map((g, i) =>
          i === index ? { ...g, status: 'Completed', buttonLabel: 'Play' } : g
        ));
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        console.error(err);
        setGames(prev => prev.map((g, i) =>
          i === index ? { ...g, status: 'Failed', buttonLabel: 'Retry' } : g
        ));
      });
  };

  return (
    <div>
      <Header />
      {loading ? (
        <Spinner/>
      ) : (
        <div className="container">
          {games.length === 0 ? (
            <p className="no-games-message">You don't have any games to download.</p>
          ) : (
            games.map((game, index) => (
              <div className="downloads" key={game.id}>
                {game.cover && <img src={game.cover} alt={game.title} className="game-cover" />}  
                <div className="download-info">
                  <h1>{game.title}</h1>
                  <div className="download-status">
                    <p>State: <strong className={`status-${game.status}`}>{game.status}</strong></p>
                    {game.status === 'Downloading' && (
                      <div className="spinner" />  // Spinner inline sin mensaje
                    )}
                  </div>
                  <div className="button-group">
                    {game.status === 'Downloading' ? (
                      <button className="cancel-button" onClick={() => cancelDownload(game.id)}>
                        {game.cancelLabel}
                      </button>
                    ) : (
                      <button className="primary-button" onClick={() => handlePrimaryButtonClick(index)}>
                        {game.buttonLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Downloads;
