import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/HeaderComponent";
import { userAuth } from "./AuthContext";  // Asegúrate de la ruta correcta
import "../styles/ProfilePage.css";
import "../styles/Spinner.css";  // Estilos para spinner
import Foto_Perfil from "../media/Foto_Perfil.jpg";

interface User {
  idUser: number;
  username: string;
}

interface Download {
  idDownload: number;
  idGame: number;
  title: string;
  price: number;
}

interface UserReview {
  idReview: number;
  idUser: number;
  idGame: number;
  review_type: string;
  description: string;
  gameTitle: string;
}

const Profile: React.FC = () => {
  const { user } = userAuth() as { user: User | null };

  // Estados de descargas
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loadingDownloads, setLoadingDownloads] = useState(false);
  const [errorDownloads, setErrorDownloads] = useState<string | null>(null);

  // Estados de reseñas
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [errorReviews, setErrorReviews] = useState<string | null>(null);

  // Toggle entre descargas y reseñas
  const [showDownloads, setShowDownloads] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  // Función auxiliar
  const fetchGameTitle = async (gameId: number, token: string): Promise<string> => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/games/details/${gameId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.title;
    } catch {
      return `Juego ${gameId}`;
    }
  };

  // Carga descargas
  useEffect(() => {
    if (!showDownloads) return;
    (async () => {
      setLoadingDownloads(true);
      setErrorDownloads(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No estás autenticado");
        const res = await axios.get<{ idDownload: number; idGame: number; price: number }[]>(
          "http://localhost:3000/api/downloads",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await Promise.all(
          res.data.map(async d => ({
            idDownload: d.idDownload,
            idGame: d.idGame,
            price: d.price,
            title: await fetchGameTitle(d.idGame, token)
          }))
        );
        setDownloads(data);
      } catch (e: any) {
        setErrorDownloads(e.message);
      } finally {
        setLoadingDownloads(false);
      }
    })();
  }, [showDownloads]);

  // Carga reseñas
  useEffect(() => {
    if (!showReviews) return;
    (async () => {
      setLoadingReviews(true);
      setErrorReviews(null);
      try {
        const token = localStorage.getItem("token");
        if (!token || !user) throw new Error("No estás autenticado");
        const res = await axios.get<{
          idReview: number;
          idGame: number;
          review_type: string;
          description: string;
        }[]>(
          `http://localhost:3000/api/users/${user.idUser}/reviews`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await Promise.all(
          res.data.map(async r => ({
            idReview: r.idReview,
            idUser: user.idUser,
            idGame: r.idGame,
            review_type: r.review_type,
            description: r.description,
            gameTitle: await fetchGameTitle(r.idGame, token)
          }))
        );
        setUserReviews(data);
      } catch (e: any) {
        setErrorReviews(e.message);
      } finally {
        setLoadingReviews(false);
      }
    })();
  }, [showReviews, user]);

  const total = downloads.reduce((sum, d) => sum + d.price, 0);

  // Spinner inline para contenedor
  const InlineSpinner: React.FC<{ message?: string }> = ({ message }) => (
    <div className="spinner-inline-container">
      <div className="spinner" />
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );

  return (
    <div className="profile-container">
      <Header />
      <div className="profile-main">
        <div className="profile-header">
          <img src={Foto_Perfil} alt="Perfil" className="profile-img" />
          <div className="profile-details">
            <h2>{user?.username || "Guest"}</h2>
            <div className="toggle-buttons">
              <button
                className={`btn-toggle ${showDownloads ? "active" : ""}`}
                onClick={() => { setShowDownloads(prev => !prev); setShowReviews(false); }}
              >
                {showDownloads ? "Hide Expenses" : "Show Expenses"}
              </button>
              <button
                className={`btn-toggle ${showReviews ? "active" : ""}`}
                onClick={() => { setShowReviews(prev => !prev); setShowDownloads(false); }}
              >
                {showReviews ? "Hide Reviews" : "Show Reviews"}
              </button>
            </div>
          </div>
        </div>

        <div className="profile-content">
          {showDownloads && (
            <div className="profile-downloads">
              {loadingDownloads ? (
                <InlineSpinner  />
              ) : errorDownloads ? (
                <p className="error-message">{errorDownloads}</p>
              ) : downloads.length === 0 ? (
                <p>You have no downloads available.</p>
              ) : (
                <> 
                  <table className="download-table">
                    <thead><tr><th>Game</th><th>Price</th></tr></thead>
                    <tbody>
                      {downloads.map(d => (
                        <tr key={d.idDownload}>
                          <td>{d.title}</td>
                          <td>${d.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <table className="download-table total-table">
                    <tbody>
                      <tr><td><strong>Total</strong></td><td><strong>${total.toFixed(2)}</strong></td></tr>
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}

          {showReviews && (
            <div className="profile-downloads ">
              {loadingReviews ? (
                <InlineSpinner />
              ) : errorReviews ? (
                <p className="error-message">{errorReviews}</p>
              ) : userReviews.length === 0 ? (
                <p>You haven't written any reviews yet..</p>
              ) : (
                <table className="download-table">
                  <thead><tr><th>Game</th><th>Type</th><th>Description</th></tr></thead>
                  <tbody>
                    {userReviews.map(r => (
                      <tr key={r.idReview}>
                        <td>{r.gameTitle}</td>
                        <td>{r.review_type}</td>
                        <td>{r.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
