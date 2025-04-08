import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { userAuth } from "./AuthContext";
import "../styles/Profile.css";
import Foto_Perfil from "../media/Foto_Perfil.jpg"

const ReviewsProfile: React.FC = () => {
    const navigate = useNavigate();
    const { user } = userAuth();

    const handleRedirect = () => navigate("/configuration");
    const gamesprofile = () => navigate("/gamesprofile");
    const wishlist = () => navigate("/wishlist");
    const reviews = () => navigate("/reviews");
    const friends = () => navigate("/friends");

    return (
        <div className="profile-container">
            <Header />

            <div className="profile-header">
                <img src={Foto_Perfil} alt="Foto de perfil" className="profile-img" />
                <div className="profile-details">
                    <h2>{user ? user.username : "Invitado"}</h2>
                    <p>Segundo de DAW es increíble</p>
                    <button onClick={handleRedirect}>Edit Profile</button>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-games">
                    <div className="games-list">
                        <p>Lista de reviews</p>
                    </div>
                </div>
                <div className="profile-info">
                    <p>Status: ?</p>
                    <p>Level: ?</p>
                    <p>Years of service: ?</p>
                    <p>Badges: ?</p>
                    <p>Friends: ?</p>
                    <button onClick={gamesprofile}>Games (?)</button>
                    <button onClick={wishlist}>Wishlist (?)</button>
                    <button onClick={reviews}>Reviews (?)</button>
                    <button onClick={friends}>Friends (?)</button>
                </div>
            </div>
        </div>
    );
};

export default ReviewsProfile;
