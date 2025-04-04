import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../assets/EditProfile.css";

const EditProfile: React.FC = () => {
  
    const [encendido, setEncendido] = useState<boolean>(false);

    // Función que alterna el estado
    const toggleEncendido = () => {
      console.log("Clic en el interruptor"); // Verificar si se está disparando el clic
      setEncendido(!encendido);
    };

    const navigate = useNavigate(); 

    const confirm = () => {
        navigate('/Configuration'); // Redirige a la ruta "/EditProfile"
    };

    return (
        <div className="edit-profile-container">
          <Header />
          
          {/* Sección General */}
          <div className="edit-profile-section general">
            <h2 className="edit-profile-header">GENERAL</h2>
            <form className="edit-profile-form">
                <label htmlFor="profile_name">PROFILE NAME:</label>
                <input 
                    type="text" 
                    id="profile_name" 
                    name="profile_name" 
                    className="edit-profile-input"
                />

                <label htmlFor="real_name">REAL NAME:</label>
                <input 
                    type="text" 
                    id="real_name" 
                    name="real_name" 
                    className="edit-profile-input"
                />

                <label htmlFor="username">USERNAME:</label>
                <input 
                    type="text" 
                    id="username" 
                    name="username" 
                    className="edit-profile-input"
                />

                <label htmlFor="biography">BIOGRAPHY:</label>
                <input 
                    type="text" 
                    id="biography" 
                    name="biography" 
                    className="edit-profile-input"
                />
            </form>
          </div>
          
          {/* Sección de Ubicación */}
          <div className="edit-profile-section location">
            <h2 className="edit-profile-header">LOCATION</h2>
            <form>
                <label htmlFor="country">COUNTRY:</label>
                <select id="country" name="country" className="edit-profile-input">
                    <option value="spain">Spain</option>
                    <option value="english">Italy</option>
                    <option value="france">France</option>
                    <option value="germany">Germany</option>
                </select>
            </form>
          </div>
          
          {/* Sección de Preferencias */}
          <div className="edit-profile-section preferences">
            <h2 className="edit-profile-header">PREFERENCES</h2>

            <div className="preference-container">
              <p>{encendido ? 'Store preferences enables' : 'Store preferences disabled'}</p>
              <div
                className={`preference-switch ${encendido ? 'on' : 'off'}`} 
                onClick={toggleEncendido}
              >
                <div className="slider"></div>
              </div>
            </div>
          </div>
          <div>
              <button className="confirm-button" onClick={confirm}>Change</button>
            </div>
        </div>
    );
};

export default EditProfile;
