import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/HeaderComponent";
import { userAuth } from "./AuthContext";
import "../styles/ProfilePage.css";
import Foto_Perfil from "../media/Foto_Perfil.jpg";

interface User {
  idUser: number;
  username: string;
}

interface Download {
  idDownload: number;
  idGame: number;
  title?: string;
  price?: number;
}

interface UserReview {
  idReview: number;
  idUser: number;
  idGame: number;
  review_type: string;
  description: string;
  gameTitle?: string;
}

const Profile: React.FC = () => {
  const { user } = userAuth() as { user: User | null };

  // Downloads states
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loadingDownloads, setLoadingDownloads] = useState(false);
  const [errorDownloads, setErrorDownloads] = useState<string | null>(null);

  // Reviews states
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [errorReviews, setErrorReviews] = useState<string | null>(null);

  // Toggle state
  const [showDownloads, setShowDownloads] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

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

  // Fetch downloads
  const loadDownloads = async (token: string) => {
    const res = await axios.get<Download[]>(
      "http://localhost:3000/api/downloads",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return Promise.all(
      res.data.map(async (d) => ({
        ...d,
        title: await fetchGameTitle(d.idGame, token)
      }))
    );
  };

  // Effect for downloads
  useEffect(() => {
    if (!showDownloads) return;
    (async () => {
      setLoadingDownloads(true);
      setErrorDownloads(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No estás autenticado");
        const data = await loadDownloads(token);
        setDownloads(data);
      } catch (e: any) {
        setErrorDownloads(e.message);
      } finally {
        setLoadingDownloads(false);
      }
    })();
  }, [showDownloads]);

  // Effect for user reviews
  useEffect(() => {
    if (!showReviews) return;
    (async () => {
      setLoadingReviews(true);
      setErrorReviews(null);
      try {
        const token = localStorage.getItem("token");
        if (!token || !user) throw new Error("No estás autenticado");

        const reviewsRes = await axios.get<UserReview[]>(
          `http://localhost:3000/api/users/${user.idUser}/reviews`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const reviewsWithTitles = await Promise.all(
          reviewsRes.data.map(async (review) => ({
            ...review,
            gameTitle: await fetchGameTitle(review.idGame, token)
          }))
        );

        setUserReviews(reviewsWithTitles);
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setErrorReviews("No se encontraron reseñas para este usuario");
          } else if (error.response?.status === 401) {
            setErrorReviews("Sesión expirada. Por favor, inicia sesión nuevamente");
          } else {
            setErrorReviews(`Error al cargar las reseñas: ${error.message}`);
          }
        } else {
          setErrorReviews("Error inesperado al cargar las reseñas");
        }
      } finally {
        setLoadingReviews(false);
      }
    })();
  }, [showReviews, user]);

  const total = downloads.reduce((sum, d) => sum + (d.price ?? 0), 0);

  return (
    <div className="profile-container">
      <Header />
      <div className="profile-main">
        <div className="profile-header">
          <img src={Foto_Perfil} alt="Foto de perfil" className="profile-img" />
          <div className="profile-details">
            <h2>{user?.username || "Invitado"}</h2>
            {/* Toggle Buttons */}
            <div className="toggle-buttons">
            <button
  className={`btn-toggle ${showDownloads ? "active" : ""}`}
  onClick={() => { setShowDownloads(!showDownloads); setShowReviews(false); }}
>
  {showDownloads ? "Ocultar Gastos" : "Mostrar Gastos"}
</button>

<button
  className={`btn-toggle ${showReviews ? "active" : ""}`}
  onClick={() => { setShowReviews(!showReviews); setShowDownloads(false); }}
>
  {showReviews ? "Ocultar Reseñas" : "Mostrar Reseñas"}
</button>

            </div>
          </div>
        </div>

        <div className="profile-content">
          {/* Downloads Table */}
          {showDownloads && (
            <div className="profile-downloads">
              {loadingDownloads && <p>Cargando gastos...</p>}
              {errorDownloads && <p className="error-message">{errorDownloads}</p>}
              {!loadingDownloads && downloads.length === 0 && (
                <p>No tienes descargas disponibles.</p>
              )}
              {downloads.length > 0 && (
                <>
                  <table className="download-table">
                    <thead>
                      <tr>
                        <th>Juego</th>
                        <th>Precio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {downloads.map((d) => (
                        <tr key={d.idDownload}>
                          <td>{d.title}</td>
                          <td>
                            <strong>${d.price?.toFixed(2)}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <table className="download-table total-table">
                    <tbody>
                      <tr>
                        <td>
                          <strong>Total</strong>
                        </td>
                        <td>
                          <strong>${total.toFixed(2)}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}
          <div className="profile-downloads">
{/* User Reviews */}
{showReviews && (
            <div className="profile-reviews">
              {loadingReviews && <p>Cargando reseñas...</p>}
              {errorReviews && <p className="error-message">{errorReviews}</p>}
              {!loadingReviews && userReviews.length === 0 && <p>No has escrito reseñas aún.</p>}
              {userReviews.length > 0 && (
                <table className="download-table">
                  <thead>
                    <tr>
                      <th>Juego</th>
                      <th>Tipo</th>
                      <th>Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userReviews.map((r) => (
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
    </div>
  );
};

export default Profile;
