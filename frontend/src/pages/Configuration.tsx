import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../styles/Configuration.css";
import { userAuth } from "./AuthContext";

const Configuration: React.FC = () => {
    const navigate = useNavigate(); 
    const { user } = userAuth();
    
    return (
        <div className="config-container">
            <Header />
            <h1 className="config-title">Configuración</h1>

            <div className="config-section config-profile">
                <h3>Profile</h3> 
                <div className="account-row">
                    <h4 className="config-label">ACCOUNT NAME:</h4> 
                    <span className="config-value">{user ? user.username : "Invitado"}</span> 
                </div>
                <p className="config-info">You can't change your account name.</p>
                <div className="account-row">
                    <h4 className="config-label">PROFILE NAME:</h4> 
                    <span className="config-value">{user ? user.username : "Invitado"}</span> 
                </div>
                <button className="config-button" onClick={() => navigate('/EditProfile')}>
                        Edit profile
                    </button>
            </div>

            <div className="config-section config-contact">
                <h3>Contact info</h3> 
                <div className="account-row">
                    <h4 className="config-label">EMAIL:</h4> 
                    <span className="config-value">*****@gmail.com</span>
                </div>
                <div className="account-row">
                    <h4 className="config-label">PHONE NUMBER:</h4> 
                    <span className="config-value">Ends in **00</span>
                </div>

                <button className="config-button" onClick={() => navigate('/ContactInfo')}>
                        Change contact info
                    </button>
            </div>

            <div className="config-section config-danger">
                <h3>Danger Zone</h3> 
                <div>
                    <h4 className="config-label">Eliminar cuenta de forma permanente:</h4> 
                    <button className="config-danger-button">Delete account</button>
                </div>
            </div>

            <div>
                <button className="config-confirm-button" onClick={() => navigate('/profile')}>
                    Confirm changes
                </button>
            </div>
        </div>
    );
};

export default Configuration;