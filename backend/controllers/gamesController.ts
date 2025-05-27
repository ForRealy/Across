import Bottleneck from 'bottleneck';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { Request, Response } from 'express';
import pool from '../db.js';
import type { RowDataPacket } from 'mysql2';

// ——— Configuración de paths y variables de entorno ———
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

// ——— Configuración del limitador: 4 peticiones por segundo ———
const limiter = new Bottleneck({ minTime: 250 });

// ——— Instancia de Axios con timeout global ———
const axiosInstance = axios.create({ timeout: 10000 });

// ——— Interface para tipar los juegos con portada y descripción ———
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
  description?: string;
}

/**
 * Genera un precio determinístico basado en el ID de juego
 */
const generatePrice = (gameId: number): number => {
  const seed = gameId * 31;
  const min = 9.99;
  const max = 29.99;
  const random = Math.abs(Math.sin(seed)) * (max - min) + min;
  return Math.round(random * 100) / 100;
};

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
 * Genera un "falso screenshot" a partir de la portada
 */
const generateFakeScreenshot = (cover: string): string => {
  return cover.replace('t_cover_big', 't_screenshot_big');
};

/**
 * Transforma la respuesta bruta de IGDB en un objeto con portada y descripción
 */
const transformGame = (game: any): GameWithCover => {
  const coverImage = game.cover?.image_id
    ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
    : 'https://via.placeholder.com/264x352?text=No+Cover';

  const base: GameWithCover = {
    id: game.id,
    title: game.name,
    cover: coverImage,
    sliderImage: game.screenshots?.[0]?.image_id
      ? `https://images.igdb.com/igdb/image/upload/t_1080p/${game.screenshots[0].image_id}.jpg`
      : generateFakeScreenshot(coverImage),
    path: `/details/${game.id}`,
    rating: game.aggregated_rating || 0,
    price: typeof game.price === 'number'
      ? game.price
      : generatePrice(game.id),
    description: game.summary || undefined,
  };

  if (game.first_release_date) {
    base.releaseDate = new Date(game.first_release_date * 1000)
      .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  return base;
};

/**
 * Transforma la respuesta para juegos populares o próximos lanzamientos
 */
const transformPopularGame = (game: any, currentTimestamp?: number): GameWithCover => {
  const base = transformGame(game);
  return {
    ...base,
    sliderImage: game.screenshots?.[0]?.image_id
      ? `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${game.screenshots[0].image_id}.jpg`
      : generateFakeScreenshot(base.cover),
    daysRemaining: currentTimestamp
      ? Math.ceil((game.first_release_date - currentTimestamp) / 86400)
      : undefined,
  };
};

// ———————————————————————————
// ——— FUNCIONES PRINCIPALES ———
// ———————————————————————————

export const searchGamesOptimized = async (query: string): Promise<GameWithCover[] | undefined> => {
  try {
    let searchQuery = `
      search "${query}";
      fields id,name,cover.image_id,first_release_date,summary;
      where category = (0, 2, 4, 8, 9);
      limit 5;
    `;
    let { data } = await igdbRequest(searchQuery);

    if (!data || data.length === 0) {
      const keywords = query.split(':')[0];
      searchQuery = `
        search "${keywords}";
        fields id,name,cover.image_id,first_release_date,summary;
        where name ~ *"${keywords}"* & name ~ *"Breath of the Wild"*;
        limit 5;
      `;
      ({ data } = await igdbRequest(searchQuery));
    }
    if (!data || data.length === 0) {
      searchQuery = `
        fields id,name,cover.image_id,first_release_date,summary;
        where name ~ *"Zelda"* & name ~ *"Breath"*;
        limit 5;
      `;
      ({ data } = await igdbRequest(searchQuery));
    }

    return data?.map(transformGame) || [];
  } catch (err) {
    console.error('Error en búsqueda optimizada:', err);
    return undefined;
  }
};

export const fetchLowRatedGames = async (): Promise<GameWithCover[] | undefined> => {
  try {
    const query = `
      fields id,name,cover.image_id,aggregated_rating,first_release_date,screenshots.image_id,summary;
      where aggregated_rating > 0
        & aggregated_rating < 60
        & first_release_date > 0
        & cover != null;
      sort aggregated_rating asc;
      limit 150;
    `;
    const { data } = await igdbRequest(query);
    const games = data.map(transformGame);
    console.log(`Fetched ${games.length} low-rated games`);
    return games;
  } catch (err) {
    console.error('Error al obtener juegos de baja calificación:', err);
    return undefined;
  }
};

export const fetchGameData = async (): Promise<GameWithCover[] | undefined> => {
  try {
    const [highRatedGames, lowRatedGames] = await Promise.all([
      // High rated games query
      (async () => {
        const query = `
          fields id,name,cover.image_id,aggregated_rating,first_release_date,screenshots.image_id,summary;
          where aggregated_rating >= 60
            & first_release_date > 0
            & aggregated_rating_count > 10
            & cover != null;
          sort aggregated_rating desc;
          limit 150;  // Increased from 100 to 150
        `;
        const { data } = await igdbRequest(query);
        const games = data.map(transformGame);
        console.log(`Fetched ${games.length} high-rated games`);
        return games;
      })(),
      // Low rated games
      fetchLowRatedGames()
    ]);

    const allGames = [
      ...(highRatedGames || []),
      ...(lowRatedGames || [])
    ];

    console.log(`Total games after combining: ${allGames.length}`);
    console.log(`High-rated games: ${highRatedGames?.length || 0}`);
    console.log(`Low-rated games: ${lowRatedGames?.length || 0}`);

    // Sort by rating but keep high-rated games first
    return allGames.sort((a: GameWithCover, b: GameWithCover) => {
      // If both are high-rated or both are low-rated, sort by rating
      if ((a.rating || 0) >= 60 && (b.rating || 0) >= 60) {
        return (b.rating || 0) - (a.rating || 0);
      }
      if ((a.rating || 0) < 60 && (b.rating || 0) < 60) {
        return (b.rating || 0) - (a.rating || 0);
      }
      // If one is high-rated and one is low-rated, high-rated comes first
      return (a.rating || 0) >= 60 ? -1 : 1;
    });
  } catch (err) {
    console.error('Error al obtener datos de juegos:', err);
    return undefined;
  }
};

export const fetchUpcomingGames = async (): Promise<GameWithCover[] | undefined> => {
  try {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const query = `
      fields id,name,cover.image_id,first_release_date,summary;
      where first_release_date >= ${currentTimestamp}
        & cover != null;
      sort first_release_date asc;
      limit 10;
    `;
    const { data } = await igdbRequest(query);
    return data.map((g: any) => transformPopularGame(g, currentTimestamp));
  } catch (err) {
    console.error('Error al obtener próximos lanzamientos:', err);
    return undefined;
  }
};

export const fetchPopularGames = async (): Promise<GameWithCover[] | undefined> => {
  try {
    const query = `
      fields id,name,cover.image_id,aggregated_rating,hypes,first_release_date,screenshots.image_id,summary;
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

export const fetchGameById = async (id: number): Promise<GameWithCover | undefined> => {
  try {
    const query = `
      fields id,name,cover.image_id,aggregated_rating,first_release_date,summary;
      where id = ${id};
    `;
    const { data } = await igdbRequest(query);
    if (!data.length) return undefined;
    return transformGame(data[0]);
  } catch (err) {
    console.error(`Error al obtener juego con ID ${id}:`, err);
    return undefined;
  }
};

// ———————————————————————————
// ——— FUNCIONES DEL CARRITO ———
// ———————————————————————————

export const addGameToCartByName = async (gameName: string): Promise<boolean> => {
  try {
    const games = await searchGamesOptimized(gameName);
    if (!games || !games.length) return false;
    const bestMatch = games.find(g => g.title.toLowerCase().includes(gameName.toLowerCase())) || games[0];
    const cart: GameWithCover[] = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!cart.some(item => item.id === bestMatch.id)) {
      cart
.push(bestMatch);
      localStorage.setItem('cart', JSON.stringify(cart));
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const removeFromCart = (gameId: number): void => {
  const cart: GameWithCover[] = JSON.parse(localStorage.getItem('cart') || '[]');
  localStorage.setItem('cart', JSON.stringify(cart.filter(g => g.id !== gameId)));
};

export const getCartItems = (): GameWithCover[] =>
  JSON.parse(localStorage.getItem('cart') || '[]');

export const clearCart = (): void =>
  localStorage.removeItem('cart');

export const testIGDBConnection = async (): Promise<boolean> => {
  try {
    const { status } = await igdbRequest(`fields id,name; limit 1;`);
    return status === 200;
  } catch {
    return false;
  }
};

export const cacheGameInDatabase = async (game: any) => {
  try {
    const gameId = parseInt(game.id);
    if (!game.name) throw new Error('Game name is required');

    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT idGame FROM games WHERE idGame = ?',
      [gameId]
    );
    if (!existing.length) {
      const priceValue = typeof game.price === 'number'
        ? game.price
        : generatePrice(gameId);

      await pool.query(`
        INSERT INTO games (
          idGame,
          name,
          releaseDate,
          publisher,
          developer,
          description,
          price,
          idLanguage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        gameId,
        game.name,
        game.first_release_date ? new Date(game.first_release_date * 1000) : new Date(),
        game.publisher?.name || null,
        game.developer?.name || null,
        game.summary || null,
        priceValue,
        1
      ]);
    }
  } catch (error) {
    console.error('Error caching game:', error);
    throw error;
  }
};

export const getGameDetails = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const query = `
      fields id,name,first_release_date,summary,cover.image_id,screenshots.image_id,publisher.name,developer.name,price;
      where id = ${id};
    `;
    const { data } = await igdbRequest(query);

    if (!data.length) {
      return res.status(404).json({ message: 'Game not found in IGDB' });
    }

    const game = data[0];
    const priceValue = typeof game.price === 'number'
      ? game.price
      : generatePrice(id);

    const base = transformGame(game);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    res.json({
      ...base,
      sliderImage: game.screenshots?.[0]?.image_id
        ? `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${game.screenshots[0].image_id}.jpg`
        : generateFakeScreenshot(base.cover),
      daysRemaining: game.first_release_date
        ? Math.ceil((game.first_release_date - currentTimestamp) / 86400)
        : undefined,
      publisher: game.publisher?.name,
      developer: game.developer?.name,
      price: priceValue,
    });
  } catch (err: any) {
    console.error('Error fetching game details:', err);
    res.status(500).json({
      message: 'Error fetching game details',
      error: err.message || 'Unknown error',
    });
  }
};

export default {
  searchGamesOptimized,
  fetchGameData,
  fetchUpcomingGames,
  fetchPopularGames,
  fetchGameById,
  fetchLowRatedGames,
  addGameToCartByName,
  removeFromCart,
  getCartItems,
  clearCart,
  testIGDBConnection,
  getGameDetails,
};
