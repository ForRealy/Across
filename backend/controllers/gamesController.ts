import Bottleneck from 'bottleneck';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// ——— Obtener directorio actual en ES modules ———
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ——— Cargar variables de entorno desde la raíz del proyecto ———
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
  releaseDate?: string;
  daysRemaining?: number;
  sliderImage?: string;
}

/**
 * Helper centralizado para hacer peticiones a IGDB,
 * aplicando el rate limiter y los headers comunes.
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
 * Transforma la respuesta bruta de IGDB en un objeto con portada.
 */
const transformGame = (game: any): GameWithCover => ({
  id: game.id,
  title: game.name,
  cover: game.cover?.image_id
    ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
    : 'https://via.placeholder.com/264x352?text=No+Cover',
  path: `/game/${game.id}`,
  rating: game.aggregated_rating || 0,
});

/**
 * Transforma la respuesta para juegos populares o próximos,
 * añadiendo sliderImage, releaseDate y daysRemaining.
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

/**
 * Obtiene los 30 juegos mejor valorados.
 * Ahora devuelve undefined en caso de error o sin datos.
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
    const list = data
      .map(transformGame)
      .sort((a: GameWithCover, b: GameWithCover): number => b.rating! - a.rating!)
      .slice(0, 30);
    return list;
  } catch (err) {
    console.error('Error al obtener datos de juegos:', err);
    return undefined;
  }
};

/**
 * Obtiene los próximos 6 lanzamientos futuros.
 * Ahora devuelve undefined en caso de error.
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
 * Obtiene los 10 juegos más populares según 'hypes'.
 * Ahora devuelve undefined en caso de error.
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
 * Obtiene un juego por su ID.
 * Ahora devuelve undefined si no hay datos o en caso de error.
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

/**
 * Type guard para errores de API.
 */
function isApiError(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}
