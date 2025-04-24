import apicalypse from 'apicalypse';
import Bottleneck from 'bottleneck';
import axios from "axios";
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Obtener el directorio actual en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde la raíz del proyecto
dotenv.config({ path: resolve(__dirname, '../.env') });

console.log('IGDB Credentials:', {
  clientId: process.env.IGDB_CLIENT_ID,
  auth: process.env.IGDB_AUTHORIZATION
});

// Configuración del limitador (4 peticiones por segundo)
const limiter = new Bottleneck({
  minTime: 250 // 1000ms / 4 = 250ms entre peticiones
});
const axiosInstance = axios.create({
  timeout: 10000 // 10 segundos
});

interface GameWithCover {
  title: string;
  cover: string;
  path: string;
  rating: number;
}

export const fetchGameData = async () => {
  try { 
    if (!process.env.IGDB_CLIENT_ID || !process.env.IGDB_AUTHORIZATION) {
      throw new Error('Las credenciales de IGDB no están configuradas correctamente');
    }

    console.log('Haciendo petición a IGDB...');
    const response = await axios({
      method: 'POST',
      url: 'https://api.igdb.com/v4/games',
      headers: {
        'Client-ID': process.env.IGDB_CLIENT_ID,
        'Authorization': `Bearer ${process.env.IGDB_AUTHORIZATION}`,
        'Accept': 'application/json'
      },
      data: 'fields name,cover.image_id,aggregated_rating,first_release_date;where aggregated_rating > 0 & first_release_date > 0 & aggregated_rating_count > 10;sort aggregated_rating desc;limit 30;'
    });

    console.log('Respuesta de IGDB:', response.data);

    const gamesWithCover = response.data
      .map((game: any) => {
        if (!game.cover || !game.cover.image_id) {
          console.warn(`Juego sin portada: ${game.name}`);
          return {
            title: game.name,
            cover: 'https://via.placeholder.com/264x352?text=No+Cover',
            path: `/game/${game.id}`,
            rating: game.aggregated_rating || 0
          };
        }
        
        return {
          title: game.name,
          cover: `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`,
          path: `/game/${game.id}`,
          rating: game.aggregated_rating || 0
        };
      })
      .sort((a: GameWithCover, b: GameWithCover) => b.rating - a.rating)
      .slice(0, 30);

    console.log('Datos transformados:', gamesWithCover);
    return gamesWithCover;
  } catch (err) {
    console.error('Error al obtener datos:', err);
    return null;
  }
};

export const fetchUpcomingGames = async () => {
  try { 
    if (!process.env.IGDB_CLIENT_ID || !process.env.IGDB_AUTHORIZATION) {
      throw new Error('Las credenciales de IGDB no están configuradas correctamente');
    }

    const response = await axios({
      method: 'POST',
      url: 'https://api.igdb.com/v4/games',
      headers: {
        'Client-ID': process.env.IGDB_CLIENT_ID,
        'Authorization': `Bearer ${process.env.IGDB_AUTHORIZATION}`,
        'Accept': 'application/json'
      },
      data: 'fields name,cover.image_id,first_release_date;where first_release_date > 1704067200 & cover != null;sort first_release_date asc;limit 6;'
    });

    const upcomingGames = response.data.map((game: any) => ({
      title: game.name,
      cover: `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`,
      releaseDate: new Date(game.first_release_date * 1000).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }));

    return upcomingGames;
  } catch (err) {
    console.error('Error al obtener próximos lanzamientos:', err);
    return null;
  }
};

export const fetchPopularGames = async () => {
  try { 
    if (!process.env.IGDB_CLIENT_ID || !process.env.IGDB_AUTHORIZATION) {
      throw new Error('Las credenciales de IGDB no están configuradas correctamente');
    }

    const response = await axios({
      method: 'POST',
      url: 'https://api.igdb.com/v4/games',
      headers: {
        'Client-ID': process.env.IGDB_CLIENT_ID,
        'Authorization': `Bearer ${process.env.IGDB_AUTHORIZATION}`,
        'Accept': 'application/json'
      },
      data: 'fields name,cover.image_id,aggregated_rating,hypes,first_release_date,screenshots.image_id;where aggregated_rating > 0 & cover != null & first_release_date > 0;sort hypes desc;limit 10;'
    });

    const popularGames = response.data.map((game: any) => ({
      title: game.name,
      cover: `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`,
      sliderImage: game.screenshots && game.screenshots.length > 0 
        ? `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${game.screenshots[0].image_id}.jpg`
        : `https://images.igdb.com/igdb/image/upload/t_1080p/${game.cover.image_id}.jpg`,
      rating: game.aggregated_rating,
      releaseDate: new Date(game.first_release_date * 1000).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }));

    return popularGames;
  } catch (err) {
    console.error('Error al obtener juegos populares:', err);
    return null;
  }
};

// Type Guard personalizado
function isApiError(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}