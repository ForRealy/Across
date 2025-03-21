import React, { useState } from "react";
import Header from "./Header";
import "../assets/Library.css";

const games = [
  { title: "Elden Ring", cover: "https://i.imgur.com/1O1Z1Z1.jpg" },
  { title: "Borderlands", cover: "https://i.imgur.com/A5Z3F3K.jpg" },
  { title: "Half-life", cover: "https://i.imgur.com/b9T7mY7.jpg" },
  { title: "Crysis", cover: "https://i.imgur.com/b9T7m07.jpg"},
];

const Library: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  return (
    <div className="container">
      <Header username="Player123" />

      {/* Barra lateral */}
      <aside className="sidebar">
        <h2>Juegos</h2>
        <ul>
          {games.map((game, index) => (
            <li key={index} onClick={() => setSelectedGame(game.cover)}>
              {game.title}
            </li>
          ))}
        </ul>
      </aside>

      {/* Contenido de las carátulas */}
      <main className="content">
        <h1>Carátulas de Juegos</h1>
        <div className="gallery">
          {games.map((game, index) => (
            <img
              key={index}
              src={game.cover}
              alt={game.title}
              className={`game-cover ${selectedGame === game.cover ? "selected" : ""}`}
              onClick={() => setSelectedGame(game.cover)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Library;
