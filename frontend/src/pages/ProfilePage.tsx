import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/HeaderComponent";
import { userAuth } from "./AuthContext";
import "../styles/ProfilePage.css";
import Foto_Perfil from "../media/Foto_Perfil.jpg";

interface Download {
  idDownload: number;
  idGame: number;
  title?: string;
  price?: number;
}

const Profile: React.FC = () => {
  const { user } = userAuth();
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGameTitle = async (gameId: number, token: string): Promise<string> => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/games/details/${gameId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.title || `Juego ${gameId}`;
    } catch (error) {
      console.error(`Error fetching title for game ${gameId}`, error);
      return `Juego ${gameId}`;
    }
  };

  useEffect(() => {
    const fetchDownloads = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No estás autenticado");
          setLoading(false);
          return;
        }

        const response = await axios.get<Download[]>(
          "http://localhost:3000/api/downloads",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const downloadsWithTitles = await Promise.all(
          response.data.map(async (download) => {
            const title = await fetchGameTitle(download.idGame, token);
            return { ...download, title };
          })
        );

        setDownloads(downloadsWithTitles);
      } catch (err: any) {
        console.error("Error al cargar las descargas:", err);
        setError(err.response?.data?.message || "Error al cargar las descargas.");
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, []);

  const total = downloads.reduce((sum, d) => sum + (d.price ?? 0), 0);

  return (
    <div className="profile-container">
      <Header />
      <div className="profile-main">
        {/* Header and profile info side by side */}
        <div className="profile-header">
          <img src={Foto_Perfil} alt="Foto de perfil" className="profile-img" />
          <div className="profile-details">
            <h2>{user ? user.username : "Invitado"}</h2>
          </div>
        </div>

        {/* Descargas */}
        <div className="profile-content">
          <div className="profile-downloads">
            {loading && <p>Loading purchases...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && downloads.length === 0 && (
              <p>No tienes descargas disponibles.</p>
            )}

            {!loading && !error && downloads.length > 0 && (
              <>
                <table className="download-table">
                  <thead>
                    <tr>
                      <th>Game</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {downloads.map((download) => (
                      <tr key={download.idDownload}>
                        <td>{download.title || `Juego ${download.idGame}`}</td>
                        <td><strong>${download.price?.toFixed(2) ?? 'N/A'}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <table className="download-table total-table">
                  <tbody>
                    <tr>
                      <td><strong>Total</strong></td>
                      <td><strong>${total.toFixed(2)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;