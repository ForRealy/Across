import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../assets/Profile.css";
import Foto_Perfil from "../media/Foto_Perfil.jpg"; 

const Profile: React.FC = () => {
    const navigate = useNavigate();

    const handleRedirect = () => navigate('/configuration');
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
                    <p> Segundo de DAW es increíble </p>
                    <button onClick={handleRedirect}>Edit Profile</button>
                </div>
            </div>

            {/* Contenedor principal con juegos a la izquierda y perfil a la derecha */}
            <div className="profile-content">
                
                {/* Juegos a la izquierda */}
                <div className="profile-games">
                    <div className="games-tabs">
                        <button>Recently Played</button>
                        <button>All Games</button>
                        <button>Perfect Games</button>
                        <button>Followed</button>
                    </div>
                    <div className="games-list">
                        {/* Aquí podrías mapear una lista de juegos en el futuro */}
                        <p>Lista de juegos...</p>
                    </div>
                </div>

                {/* Panel derecho con información */}
                <div className="profile-info">
                    <p>Status: -----</p>
                    <p>Level: ??</p>
                    <p>Years of Service: ?</p>
                    <p>Badges: ?</p>
                    <p>Friends: ?</p>
                    <button onClick={games}>Games (???)</button>
                    <button onClick={wishlist}>Wishlist (???)</button>
                    <button onClick={reviews}>Reviews (???)</button>
                    <button onClick={friends}>Friends (?)</button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
