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
        <div className="container">
          <Header username="Player123" />
          <div className="general">
            <h2>GENERAL</h2>
            <form>
                <label htmlFor="profile_name">PROFILE NAME:</label>
                <input type="text" id="profile_name" name="profile_name" />

                <label htmlFor="real_name">REAL NAME:</label>
                <input type="text" id="real_name" name="real_name" />

                <label htmlFor="username">USERNAME:</label>
                <input type="text" id="username" name="username" />

                <label htmlFor="biography">BIOGRAPHY:</label>
                <input type="text" id="biography" name="biography" />
            </form>
          </div>
          <div className="location">
            <h2>LOCATION</h2>
            <form>
                <label htmlFor="country">COUNTRY:</label>
                <select id="country" name="country">
                    <option value="spain">Spain</option>
                    <option value="france">France</option>
                    <option value="germany">Germany</option>
                </select>
            </form>
          </div>
          <div className="preferences">
            <h2>STORE PREFERENCES</h2>
            <div 
              className={`switch ${encendido ? 'on' : 'off'}`} 
              onClick={toggleEncendido}
            >
              <div className="slider"></div>
            </div>
            <p>{encendido ? 'Store preferences enabled' : 'Store preferences disabled'}</p>
          </div>
          <div>
            <button onClick={confirm}> Change </button>
          </div>
        </div>
        
    );
};

export default EditProfile;
