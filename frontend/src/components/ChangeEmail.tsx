import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "../assets/EditProfile.css";

const ChangeEmail: React.FC = () => {
  
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
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" />
            </form>
          </div>
          <div>
            <button onClick={confirm}> Change </button>
          </div>
        </div>
        
    );
};

export default ChangeEmail;
