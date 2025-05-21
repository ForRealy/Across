import React, { useState, useEffect } from "react";
import Header from "../components/HeaderComponent";
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
  const [minStarRating, setMinStarRating] = useState<number>(0); // 0–5
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartStatus, setCartStatus] = useState<{
    [key: number]: "loading" | "success" | "error" | undefined;
  }>({});

  useEffect(() => {
    const loadGames = async () => {
      try {
        const response = await axios.get<Game[]>(
          "http://localhost:3000/api/games/library",
          { withCredentials: true, params: { includeCover: true } }
        );
        setGames(response.data);
        setFilteredGames(response.data);
      } catch (err) {
        if (err instanceof AxiosError) {
          setError(err.response?.data?.message || "Error al cargar los juegos");
        }
      } finally {
        setLoading(false);
      }
    };
    loadGames();
  }, []);

  useEffect(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

    let filtered = [...games];

    if (searchTerm.trim()) {
      const normalizedSearch = normalizeString(searchTerm.trim());
      filtered = filtered.filter((g) => {
        const normalizedTitle = normalizeString(g.title || "");
        return normalizedTitle.includes(normalizedSearch);
      });
    }

    if (minPrice !== undefined) {
      filtered = filtered.filter(
        (g) => typeof g.price === "number" && g.price >= minPrice
      );
    }

    if (maxPrice !== undefined) {
      filtered = filtered.filter(
        (g) => typeof g.price === "number" && g.price <= maxPrice
      );
    }

    if (minStarRating > 0) {
      const min = minStarRating * 20;
      const max = min + 20;
      filtered = filtered.filter(
        (g) =>
          typeof g.rating === "number" &&
          g.rating >= min &&
          g.rating < max
      );
    }
    setFilteredGames(filtered);
  }, [searchTerm, minPrice, maxPrice, minStarRating, games]);

  const updateCartStatus = (
    gameId: number,
    status: "loading" | "success" | "error" | undefined
  ) => {
    setCartStatus((prev) => ({ ...prev, [gameId]: status }));
  };

  const goToGamePage = (gameId: number) => {
    window.location.href = `/details/${gameId}`;
  };

  if (loading) return <div className="loading-message">Cargando juegos...</div>;

  return (
    <div className="library-container">
      <Header />

      <div className="library-layout">
        <aside className="library-sidebar">
          <h2 className="library-sidebar-title">Buscar juegos</h2>

          <input
            type="text"
            placeholder="Buscar por título..."
            className="library-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="library-filter-group">
            <h3>Filtrar por precio</h3>
            <input
              type="number"
              placeholder="Precio mínimo"
              value={minPrice ?? ""}
              onChange={(e) =>
                setMinPrice(e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className="library-filter-input"
            />
            <input
              type="number"
              placeholder="Precio máximo"
              value={maxPrice ?? ""}
              onChange={(e) =>
                setMaxPrice(e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className="library-filter-input"
            />
          </div>

          <StarRatingFilter
            minStarRating={minStarRating}
            setMinStarRating={setMinStarRating}
          />
        </aside>

        <main className="library-content">
          {error && <div className="error-message">{error}</div>}
          <div className="library-gallery">
            {filteredGames.length === 0 ? (
              <div className="empty-message">No hay juegos disponibles</div>
            ) : (
              filteredGames.map((game) => (
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
                      setStatus={(status) => updateCartStatus(game.id, status)}
                      setError={setError}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Library;
