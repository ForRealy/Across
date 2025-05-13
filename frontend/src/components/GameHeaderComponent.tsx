import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddToCartButton from "./AddToCartButtonComponent";
import "../styles/GameHeaderComponent.css"; // Importar el CSS específico

interface GameHeaderProps {
  title: string;
  gameId?: number;
}

const GameHeader: React.FC<GameHeaderProps> = ({ title, gameId }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | undefined>(undefined);
  const [error, setError] = useState<string>("");

  const goBack = () => {
    navigate(-1); // Regresa a la página anterior
  };

  return (
    <div className="gamepage-header">
      <h1 className="gamepage-title">{title}</h1>
      <div className="gamepage-action-buttons">
        <button onClick={goBack} className="btn-back">
          Go Back
        </button>
        {gameId && (
          <AddToCartButton 
            gameId={gameId} 
            status={status} 
            setStatus={setStatus} 
            setError={setError} 
          />
        )}
      </div>
    </div>
  );
};

export default GameHeader;
