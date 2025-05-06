import Bottleneck from 'bottleneck';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// ——— Configuración de paths y variables de entorno ———
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

// ——— Configuración del limitador: 4 peticiones por segundo ———
const limiter = new Bottleneck({ minTime: 250 });

// ——— Instancia de Axios con timeout global ———
const axiosInstance = axios.create({ timeout: 10000 });

// ——— Interface para tipar los juegos con portada ———
export interface GameWithCover {
  id?: number;
  title: string;
  cover: string;
  path?: string;
  rating?: number;
  price?: number;
  releaseDate?: string;
  daysRemaining?: number;
  sliderImage?: string;
}

/**
 * Helper centralizado para hacer peticiones a IGDB
 */
const igdbRequest = async (body: string) => {
  if (!process.env.IGDB_CLIENT_ID || !process.env.IGDB_AUTHORIZATION) {
    throw new Error('Las credenciales de IGDB no están configuradas correctamente');
  }

  return limiter.schedule(() =>
    axiosInstance.post(
      'https://api.igdb.com/v4/games',
      body,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID!,
          'Authorization': `Bearer ${process.env.IGDB_AUTHORIZATION!}`,
          'Accept': 'application/json',
        },
      }
    )
  );
};

/**
 * Transforma la respuesta bruta de IGDB en un objeto con portada
 */
const transformGame = (game: any): GameWithCover => ({
  id: game.id,
  title: game.name,
  cover: game.cover?.image_id
    ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
    : 'https://via.placeholder.com/264x352?text=No+Cover',
  path: `/game/${game.id}`,
  rating: game.aggregated_rating || 0,
  price: game.price || 59.99, // Precio por defecto
});

/**
 * Transforma la respuesta para juegos populares o próximos
 */
const transformPopularGame = (game: any, currentTimestamp?: number): GameWithCover => {
  const base = transformGame(game);
  return {
    ...base,
    sliderImage: game.screenshots?.[0]?.image_id
      ? `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${game.screenshots[0].image_id}.jpg`
      : base.cover,
    releaseDate: new Date(game.first_release_date * 1000)
      .toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
    daysRemaining: currentTimestamp
      ? Math.ceil((game.first_release_date - currentTimestamp) / 86400)
      : undefined,
  };
};

// ———————————————————————————
// ——— FUNCIONES PRINCIPALES ———
// ———————————————————————————

/**
 * Busca juegos por nombre
 */
export const searchGamesOptimized = async (query: string): Promise<GameWithCover[] | undefined> => {
  try {
    // Estrategia 1: Búsqueda exacta primero
    let searchQuery = `
      search "${query}";
      fields id,name,cover.image_id;
      where category = (0, 2, 4, 8, 9);
      limit 5;
    `;
    
    let { data } = await igdbRequest(searchQuery);
    
    // Estrategia 2: Si no hay resultados, intentar con términos clave
    if (!data || data.length === 0) {
      const keywords = query.split(':')[0]; // "The Legend of Zelda"
      searchQuery = `
        search "${keywords}";
        fields id,name,cover.image_id;
        where name ~ *"${keywords}"* & name ~ *"Breath of the Wild"*;
        limit 5;
      `;
      const response = await igdbRequest(searchQuery);
      data = response.data;
    }

    // Estrategia 3: Si sigue sin resultados, buscar solo palabras clave
    if (!data || data.length === 0) {
      searchQuery = `
        fields id,name,cover.image_id;
        where name ~ *"Zelda"* & name ~ *"Breath"*;
        limit 5;
      `;
      const response = await igdbRequest(searchQuery);
      data = response.data;
    }

    return data?.map(transformGame) || [];
  } catch (err) {
    console.error('Error en búsqueda optimizada:', err);
    return undefined;
  }
};



/**
 * Obtiene los 30 juegos mejor valorados
 */
export const fetchGameData = async (): Promise<GameWithCover[] | undefined> => {
  try {
    const query = `
      fields id,name,cover.image_id,aggregated_rating,first_release_date;
      where aggregated_rating > 0
        & first_release_date > 0
        & aggregated_rating_count > 10;
      sort aggregated_rating desc;
      limit 30;
    `;
    const { data } = await igdbRequest(query);
    return data.map(transformGame).sort((a: GameWithCover, b: GameWithCover) => (b.rating || 0) - (a.rating || 0));
  } catch (err) {
    console.error('Error al obtener datos de juegos:', err);
    return undefined;
  }
};

/**
 * Obtiene los próximos 6 lanzamientos
 */
export const fetchUpcomingGames = async (): Promise<GameWithCover[] | undefined> => {
  try {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const query = `
      fields id,name,cover.image_id,first_release_date;
      where first_release_date >= ${currentTimestamp}
        & cover != null;
      sort first_release_date asc;
      limit 6;
    `;
    const { data } = await igdbRequest(query);
    return data.map((g: any) => transformPopularGame(g, currentTimestamp));
  } catch (err) {
    console.error('Error al obtener próximos lanzamientos:', err);
    return undefined;
  }
};

/**
 * Obtiene los 10 juegos más populares
 */
export const fetchPopularGames = async (): Promise<GameWithCover[] | undefined> => {
  try {
    const query = `
      fields id,name,cover.image_id,aggregated_rating,hypes,first_release_date,screenshots.image_id;
      where aggregated_rating > 0
        & cover != null
        & first_release_date > 0;
      sort hypes desc;
      limit 10;
    `;
    const { data } = await igdbRequest(query);
    return data.map((g: any) => transformPopularGame(g));
  } catch (err) {
    console.error('Error al obtener juegos populares:', err);
    return undefined;
  }
};

/**
 * Obtiene un juego por su ID
 */
export const fetchGameById = async (id: number): Promise<GameWithCover | undefined> => {
  try {
    const query = `
      fields id,name,cover.image_id,aggregated_rating,first_release_date;
      where id = ${id};
    `;
    const { data } = await igdbRequest(query);
    if (data.length === 0) return undefined;
    return transformGame(data[0]);
  } catch (err) {
    console.error(`Error al obtener juego con ID ${id}:`, err);
    return undefined;
  }
};

// ———————————————————————————
// ——— FUNCIONES DEL CARRITO ———
// ———————————————————————————

/**
 * Añade un juego al carrito (localStorage)
 */
export const addGameToCartByName = async (gameName: string): Promise<boolean> => {
  try {
    // Primero buscar el juego
    const games = await searchGamesOptimized(gameName);
    
    if (!games || games.length === 0) {
      console.warn('No se encontró el juego:', gameName);
      return false;
    }

    // Buscar la mejor coincidencia (no exacta)
    const bestMatch = games.find(game => 
      game.title.toLowerCase().includes(gameName.toLowerCase())
    ) || games[0];

    // Añadir al carrito
    const cart: GameWithCover[] = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (!cart.some(item => item.id === bestMatch.id)) {
      cart.push(bestMatch);
      localStorage.setItem('cart', JSON.stringify(cart));
      console.log(`Añadido al carrito: ${bestMatch.title}`);
      return true;
    }

    console.warn('El juego ya está en el carrito:', bestMatch.title);
    return false;
  } catch (err) {
    console.error('Error al añadir al carrito:', err);
    return false;
  }
};


/**
 * Elimina un juego del carrito
 */
export const removeFromCart = (gameId: number): void => {
  const cart: GameWithCover[] = JSON.parse(localStorage.getItem('cart') || '[]');
  const newCart = cart.filter(game => game.id !== gameId);
  localStorage.setItem('cart', JSON.stringify(newCart));
};

/**
 * Obtiene todos los juegos del carrito
 */
export const getCartItems = (): GameWithCover[] => {
  return JSON.parse(localStorage.getItem('cart') || '[]');
};

/**
 * Vacía el carrito por completo
 */
export const clearCart = (): void => {
  localStorage.removeItem('cart');
};

export const testIGDBConnection = async (): Promise<boolean> => {
  try {
    const query = `fields id,name; limit 1;`;
    const response = await igdbRequest(query);
    return response.status === 200;
  } catch (err) {
    console.error('Error de conexión con IGDB:', err);
    return false;
  }
};


/**
 * Type guard para errores de API
 */
function isApiError(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}

export default {
  searchGamesOptimized,
  fetchGameData,
  fetchUpcomingGames,
  fetchPopularGames,
  fetchGameById,
  addGameToCartByName,
  removeFromCart,
  getCartItems,
  clearCart,
  testIGDBConnection,
};