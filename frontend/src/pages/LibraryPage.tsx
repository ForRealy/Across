import React, { useState, useEffect } from "react";
import Header from "../components/HeaderComponent";
import Spinner from "../components/Spinner";  // Importamos el Spinner
import AddToCartButton from "../components/AddToCartButtonComponent";
import StarRating from "../components/StarRatingComponent";
import StarRatingFilter from "../components/StarRatingFilter";
import "../styles/LibraryPage.css";
import axios, { AxiosError } from "axios";

axios.defaults.withCredentials = true;

interface Game {
  id: number;
  title: string;
  cover: string;
  sliderImage?: string;
  path: string;
  rating: number; // out of 100
  price?: number;
}

const Library: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [minStarRating, setMinStarRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);    // Estado de carga
  const [error, setError] = useState<string | null>(null);
  const [cartStatus, setCartStatus] = useState<{
    [key: number]: "loading" | "success" | "error" | undefined;
  }>({});

  // Sidebar visibility state
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Oculta sidebar al hacer scroll hacia abajo
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && sidebarVisible) {
        setSidebarVisible(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, sidebarVisible]);

  // Carga de juegos
  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Game[]>(
          "http://localhost:3000/api/games/library",
          { withCredentials: true, params: { includeCover: true } }
        );
        console.log(`Received ${response.data.length} games from API`);
        console.log('Games by rating:', {
          highRated: response.data.filter(g => (g.rating || 0) >= 60).length,
          lowRated: response.data.filter(g => (g.rating || 0) < 60).length
        });
        setGames(response.data);
        setFilteredGames(response.data);
      } catch (err) {
        if (err instanceof AxiosError) {
          console.error('Error loading games:', err);
          setError(err.response?.data?.message || "Error al cargar los juegos");
        }
      } finally {
        setLoading(false);
      }
    };
    loadGames();
  }, []);

  // Filtrado: búsqueda, precio, calificación
  useEffect(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

    let filtered = [...games];
    
    // Apply low-rated filter first
    if (minStarRating > 0) {
      const min = minStarRating * 20;
      const max = min + 20;
      filtered = filtered.filter(
        g => g.rating >= min && g.rating < max
      );
    }

    if (searchTerm.trim()) {
      const ns = normalizeString(searchTerm);
      filtered = filtered.filter(g =>
        normalizeString(g.title).includes(ns)
      );
    }
    if (minPrice !== undefined) {
      filtered = filtered.filter(
        g => typeof g.price === "number" && g.price >= minPrice
      );
    }
    if (maxPrice !== undefined) {
      filtered = filtered.filter(
        g => typeof g.price === "number" && g.price <= maxPrice
      );
    }

    console.log(`Final filtered games count: ${filtered.length}`);
    setFilteredGames(filtered);
  }, [searchTerm, minPrice, maxPrice, minStarRating, games]);

  const updateCartStatus = (
    gameId: number,
    status: "loading" | "success" | "error" | undefined
  ) => setCartStatus(prev => ({ ...prev, [gameId]: status }));

  const goToGamePage = (gameId: number) => {
    window.location.href = `/details/${gameId}`;
  };

  return (
    <div className="library-container">
      <Header />

      {loading ? (
        <Spinner/>  // Spinner en carga
      ) : (
        <div className="library-layout">
          <aside className={`library-sidebar ${!sidebarVisible ? "hidden" : ""}`}>
            <button
              id="toggleSidebar"
              className="sidebar-toggle-btn"
              onClick={() => setSidebarVisible(!sidebarVisible)}
            >
              {sidebarVisible ? "⮜" : "➤"}
            </button>
            <h2 className="library-sidebar-title">Search and filter</h2>
            <div className="library-filters">
              <input
                type="text"
                placeholder="Search by title..."
                className="library-search-input"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              
              <div className="library-filter-group">
                <h3>Price filter</h3>
                <input
                  type="number"
                  placeholder="MIN"
                  value={minPrice ?? ""}
                  onChange={e =>
                    setMinPrice(
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  className="library-filter-input"
                />
                <input
                  type="number"
                  placeholder="MAX"
                  value={maxPrice ?? ""}
                  onChange={e =>
                    setMaxPrice(
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  className="library-filter-input"
                />
              </div>
              <div className="library-filter-group">
                <h3>Reviews filter</h3>
                <StarRatingFilter
                  minStarRating={minStarRating}
                  setMinStarRating={setMinStarRating}
                />
              </div>
            </div>
          </aside>

          <main className="library-content">
            {error && <div className="error-message">{error}</div>}
            <div className="library-gallery">
              {filteredGames.length === 0 ? (
                <div className="empty-message">No hay juegos disponibles</div>
              ) : (
                filteredGames.map(game => (
                  <div key={game.id} className="library-game-item">
                    <img
                      src={game.cover}
                      alt={game.title}
                      className="library-game-cover"
                      onClick={() => goToGamePage(game.id)}
                    />
                    <div className="library-game-info">
                      <h3 className="library-game-title">{game.title}</h3>
                      <div className="star-rating-wrapper">
                        <StarRating rating={game.rating} />
                        {game.price !== undefined && (
                          <span className="library-game-price">
                            ${game.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="library-button-container">
                      <AddToCartButton
                        gameId={game.id}
                        status={cartStatus[game.id]}
                        setStatus={status => updateCartStatus(game.id, status)}
                        setError={setError}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default Library;
