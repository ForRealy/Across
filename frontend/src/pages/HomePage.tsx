import React, { useState, useEffect } from "react";
import Header from "../components/HeaderComponent";
import Spinner from "../components/Spinner";
import "../styles/HomePage.css";
import axios from "axios";
import PopularGames from "../components/PopularComponent";
import UpcomingGames from "../components/UpcomingComponent";

// Asegúrate de que Game tiene un campo id
interface Game {
  id: number;
  title: string;
  cover: string;
  sliderImage: string;
  rating?: number;
  releaseDate?: string;
}

const Home: React.FC = () => {
  const [popularGames, setPopularGames] = useState<Game[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true); // Estado de carga

  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      try {
        const [popularResponse, upcomingResponse] = await Promise.all([
          axios.get<Game[]>("http://localhost:3000/api/games/popular"),
          axios.get<Game[]>("http://localhost:3000/api/games/upcoming")
        ]);
        setPopularGames(popularResponse.data);
        setUpcomingGames(upcomingResponse.data);
      } catch (error) {
        console.error("Error al cargar juegos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  useEffect(() => {
    if (!popularGames.length) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % popularGames.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [popularGames]);

  return (
    <div className="home-page-wrapper">
      <Header />
      {loading ? (
        <Spinner/>
      ) : (
        <main className="home-main">
          <PopularGames
            popularGames={popularGames}
            currentSlide={currentSlide}
            setCurrentSlide={setCurrentSlide}
          />
          <UpcomingGames upcomingGames={upcomingGames} />
        </main>
      )}
    </div>
  );
};

export default Home;
