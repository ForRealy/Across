import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../assets/EditProfile.css";

const ChangeNumber: React.FC = () => {
  
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
                <label htmlFor="numberPhone">Number phone:</label>
                <input type="number" id="numberPhone" name="numberPhone" />
            </form>
          </div>
          <div>
            <button onClick={confirm}> Change </button>
          </div>
        </div>
        
    );
};

export default ChangeNumber;
