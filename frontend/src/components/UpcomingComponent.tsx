import React from "react";
import { useNavigate } from "react-router-dom";

interface Game {
  id: number;
  title: string;
  cover: string;
  releaseDate?: string;
}

interface UpcomingGamesProps {
  upcomingGames: Game[];
}

const UpcomingGames: React.FC<UpcomingGamesProps> = ({ upcomingGames }) => {
  const navigate = useNavigate();

  return (
    
    <section className="upcoming-section">
      <h2 className="section-title">Próximos Lanzamientos</h2>
      <div className="upcoming-games">
        {upcomingGames.map((game, index) => (
          <div
            key={index}
            className="upcoming-game-card"
            onClick={() => {
              const id = game.id
              navigate(`/details/${id}`);
            }}
          >
            <img
              src={game.cover}
              alt={game.title}
              className="upcoming-game-image"
            />
            <div className="upcoming-game-info">
              <h3>{game.title}</h3>
              <p>Lanzamiento: {game.releaseDate}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UpcomingGames;
