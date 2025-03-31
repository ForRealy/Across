import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../assets/Profile.css";
import Foto_Perfil from "../media/Foto_Perfil.jpg"; 

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const handleRedirect = () => navigate('/configuration');
    const backProfile = () => navigate('/profile');
    const games = () => navigate('/games');
    const wishlist = () => navigate('/wishlist');
    const reviews = () => navigate('/reviews');
    const friends = () => navigate('/friends');

    return (
        <div className="container">
            <Header username="Player123" />

            {/* Sección superior con la imagen de perfil y nombre */}
            <div className="profile-header">
                <img src={Foto_Perfil} alt="Foto de perfil" className="profile-img" />
                <div className="profile-details">
                    <h2>Player123</h2>
                    <p> Segunda de DAW es increíble </p>
                    <button onClick={handleRedirect}>Edit Profile</button>
                </div>
            </div>

            {/* Contenedor principal con juegos a la izquierda y perfil a la derecha */}
            <div className="profile-content">
                
                {/* Juegos a la izquierda */}
                <div className="profile-games">
                     {/* Aquí irán todas las reseñas */}
                </div>

                {/* Panel derecho con información */}
                <div className="profile-info">
                    <p>Status: Online</p>
                    <p>Level: 60</p>
                    <p>Years of Service: 6</p>
                    <p>Badges: 84</p>
                    <p>Friends: 7</p>
                    <button onClick={backProfile}>Profile</button>
                    <button onClick={games}>Games (350)</button>
                    <button onClick={wishlist}>Wishlist (120)</button>
                    <button onClick={reviews}>Reviews (32)</button>
                    <button onClick={friends}>Friends (7)</button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
