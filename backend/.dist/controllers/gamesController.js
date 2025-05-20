var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Bottleneck from 'bottleneck';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import pool from '../db.js';
// ——— Configuración de paths y variables de entorno ———
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });
// ——— Configuración del limitador: 4 peticiones por segundo ———
const limiter = new Bottleneck({ minTime: 250 });
// ——— Instancia de Axios con timeout global ———
const axiosInstance = axios.create({ timeout: 10000 });
/**
 * Helper centralizado para hacer peticiones a IGDB
 */
const igdbRequest = (body) => __awaiter(void 0, void 0, void 0, function* () {
    if (!process.env.IGDB_CLIENT_ID || !process.env.IGDB_AUTHORIZATION) {
        throw new Error('Las credenciales de IGDB no están configuradas correctamente');
    }
    return limiter.schedule(() => axiosInstance.post('https://api.igdb.com/v4/games', body, {
        headers: {
            'Client-ID': process.env.IGDB_CLIENT_ID,
            'Authorization': `Bearer ${process.env.IGDB_AUTHORIZATION}`,
            'Accept': 'application/json',
        },
    }));
});
/**
 * Genera un "falso screenshot" a partir de la portada
 */
const generateFakeScreenshot = (cover) => {
    // Assuming the cover URL is in a specific format, modify as needed
    return cover.replace('t_cover_big', 't_screenshot_big'); // Change the transformation as needed
};
/**
 * Transforma la respuesta bruta de IGDB en un objeto con portada
 */
const transformGame = (game) => {
    var _a, _b, _c;
    const coverImage = ((_a = game.cover) === null || _a === void 0 ? void 0 : _a.image_id)
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        : 'https://via.placeholder.com/264x352?text=No+Cover';
    return {
        id: game.id,
        title: game.name,
        cover: coverImage,
        sliderImage: ((_c = (_b = game.screenshots) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.image_id)
            ? `https://images.igdb.com/igdb/image/upload/t_1080p/${game.screenshots[0].image_id}.jpg`
            : generateFakeScreenshot(coverImage),
        path: `/details/${game.id}`,
        rating: game.aggregated_rating || 0,
        price: game.price || 59.99, // Precio por defecto
    };
};
/**
 * Transforma la respuesta para juegos populares o próximos
 */
const transformPopularGame = (game, currentTimestamp) => {
    var _a, _b;
    const base = transformGame(game);
    return Object.assign(Object.assign({}, base), { sliderImage: ((_b = (_a = game.screenshots) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.image_id)
            ? `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${game.screenshots[0].image_id}.jpg`
            : generateFakeScreenshot(base.cover), releaseDate: new Date(game.first_release_date * 1000)
            .toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }), daysRemaining: currentTimestamp
            ? Math.ceil((game.first_release_date - currentTimestamp) / 86400)
            : undefined });
};
// ———————————————————————————
// ——— FUNCIONES PRINCIPALES ———
// ———————————————————————————
/**
 * Busca juegos por nombre
 */
export const searchGamesOptimized = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Estrategia 1: Búsqueda exacta primero
        let searchQuery = `
      search "${query}";
      fields id,name,cover.image_id;
      where category = (0, 2, 4, 8, 9);
      limit 5;
    `;
        let { data } = yield igdbRequest(searchQuery);
        // Estrategia 2: Si no hay resultados, intentar con términos clave
        if (!data || data.length === 0) {
            const keywords = query.split(':')[0]; // "The Legend of Zelda"
            searchQuery = `
        search "${keywords}";
        fields id,name,cover.image_id;
        where name ~ *"${keywords}"* & name ~ *"Breath of the Wild"*;
        limit 5;
      `;
            const response = yield igdbRequest(searchQuery);
            data = response.data;
        }
        // Estrategia 3: Si sigue sin resultados, buscar solo palabras clave
        if (!data || data.length === 0) {
            searchQuery = `
        fields id,name,cover.image_id;
        where name ~ *"Zelda"* & name ~ *"Breath"*;
        limit 5;
      `;
            const response = yield igdbRequest(searchQuery);
            data = response.data;
        }
        return (data === null || data === void 0 ? void 0 : data.map(transformGame)) || [];
    }
    catch (err) {
        console.error('Error en búsqueda optimizada:', err);
        return undefined;
    }
});
/**
 * Obtiene los 30 juegos mejor valorados
 */
export const fetchGameData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = `
      fields id,name,cover.image_id,aggregated_rating,first_release_date,screenshots.image_id;
      where aggregated_rating > 0
        & first_release_date > 0
        & aggregated_rating_count > 10
        & cover != null;
      sort aggregated_rating desc;
      limit 250;
    `;
        const { data } = yield igdbRequest(query);
        return data.map(transformGame).sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    catch (err) {
        console.error('Error al obtener datos de juegos:', err);
        return undefined;
    }
});
/**
 * Obtiene los próximos 6 lanzamientos
 */
export const fetchUpcomingGames = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const query = `
      fields id,name,cover.image_id,first_release_date;
      where first_release_date >= ${currentTimestamp}
        & cover != null;
      sort first_release_date asc;
      limit 6;
    `;
        const { data } = yield igdbRequest(query);
        return data.map((g) => transformPopularGame(g, currentTimestamp));
    }
    catch (err) {
        console.error('Error al obtener próximos lanzamientos:', err);
        return undefined;
    }
});
/**
 * Obtiene los 10 juegos más populares
 */
export const fetchPopularGames = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = `
      fields id,name,cover.image_id,aggregated_rating,hypes,first_release_date,screenshots.image_id;
      where aggregated_rating > 0
        & cover != null
        & first_release_date > 0;
      sort hypes desc;
      limit 10;
    `;
        const { data } = yield igdbRequest(query);
        return data.map((g) => transformPopularGame(g));
    }
    catch (err) {
        console.error('Error al obtener juegos populares:', err);
        return undefined;
    }
});
/**
 * Obtiene un juego por su ID
 */
export const fetchGameById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = `
      fields id,name,cover.image_id,aggregated_rating,first_release_date;
      where id = ${id};
    `;
        const { data } = yield igdbRequest(query);
        if (data.length === 0)
            return undefined;
        return transformGame(data[0]);
    }
    catch (err) {
        console.error(`Error al obtener juego con ID ${id}:`, err);
        return undefined;
    }
});
// ———————————————————————————
// ——— FUNCIONES DEL CARRITO ———
// ———————————————————————————
/**
 * Añade un juego al carrito (localStorage)
 */
export const addGameToCartByName = (gameName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Primero buscar el juego
        const games = yield searchGamesOptimized(gameName);
        if (!games || games.length === 0) {
            console.warn('No se encontró el juego:', gameName);
            return false;
        }
        // Buscar la mejor coincidencia (no exacta)
        const bestMatch = games.find(game => game.title.toLowerCase().includes(gameName.toLowerCase())) || games[0];
        // Añadir al carrito
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (!cart.some(item => item.id === bestMatch.id)) {
            cart.push(bestMatch);
            localStorage.setItem('cart', JSON.stringify(cart));
            console.log(`Añadido al carrito: ${bestMatch.title}`);
            return true;
        }
        console.warn('El juego ya está en el carrito:', bestMatch.title);
        return false;
    }
    catch (err) {
        console.error('Error al añadir al carrito:', err);
        return false;
    }
});
/**
 * Elimina un juego del carrito
 */
export const removeFromCart = (gameId) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const newCart = cart.filter(game => game.id !== gameId);
    localStorage.setItem('cart', JSON.stringify(newCart));
};
/**
 * Obtiene todos los juegos del carrito
 */
export const getCartItems = () => {
    return JSON.parse(localStorage.getItem('cart') || '[]');
};
/**
 * Vacía el carrito por completo
 */
export const clearCart = () => {
    localStorage.removeItem('cart');
};
export const testIGDBConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = `fields id,name; limit 1;`;
        const response = yield igdbRequest(query);
        return response.status === 200;
    }
    catch (err) {
        console.error('Error de conexión con IGDB:', err);
        return false;
    }
});
export const cacheGameInDatabase = (game) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const gameId = parseInt(game.id);
        console.log('Attempting to cache game:', gameId);
        // Validate required fields
        if (!game.name) {
            console.error('Game name is required but was not provided');
            throw new Error('Game name is required');
        }
        // Check if game already exists
        const [existingGames] = yield pool.query('SELECT idGame FROM games WHERE idGame = ?', [gameId]);
        if (existingGames.length === 0) {
            // Insert new game with validated data
            yield pool.query(`
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
                ((_a = game.publisher) === null || _a === void 0 ? void 0 : _a.name) || null,
                ((_b = game.developer) === null || _b === void 0 ? void 0 : _b.name) || null,
                game.summary || null,
                game.price || 59.99,
                1 // Default to Spanish (idLanguage = 1)
            ]);
            console.log('Game successfully cached in database:', gameId);
        }
        else {
            console.log('Game already exists in database:', gameId);
        }
    }
    catch (error) {
        console.error('Error caching game:', error);
        throw error;
    }
});
export const getGameDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e, _f, _g, _h, _j, _k;
    try {
        const gameId = parseInt(req.params.id);
        console.log('Fetching game details for ID:', gameId);
        // First check if game exists in our database
        const [existingGames] = yield pool.query('SELECT * FROM games WHERE idGame = ?', [gameId]);
        if (existingGames.length > 0) {
            // Game exists in our database, return it
            const game = existingGames[0];
            console.log('Game found in database:', gameId);
            res.json({
                id: game.idGame,
                title: game.name,
                cover: ((_c = game.cover) === null || _c === void 0 ? void 0 : _c.image_id) ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg` : null,
                sliderImage: ((_e = (_d = game.screenshots) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.image_id) ? `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${game.screenshots[0].image_id}.jpg` : null,
                releaseDate: game.releaseDate,
                description: game.description,
                publisher: game.publisher,
                developer: game.developer,
                price: game.price
            });
            return;
        }
        // Game not in database, fetch from IGDB
        console.log('Game not found in database, fetching from IGDB:', gameId);
        const query = `
            fields id,name,first_release_date,summary,cover.image_id,screenshots.image_id,publisher.name,developer.name,price;
            where id = ${gameId};
        `;
        try {
            const { data } = yield igdbRequest(query);
            if (data && data.length > 0) {
                const game = data[0];
                // Cache the game in our database
                yield cacheGameInDatabase(game);
                // Format the response
                const formattedGame = {
                    id: parseInt(game.id),
                    title: game.name,
                    cover: ((_f = game.cover) === null || _f === void 0 ? void 0 : _f.image_id) ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg` : null,
                    sliderImage: ((_h = (_g = game.screenshots) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.image_id) ? `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${game.screenshots[0].image_id}.jpg` : null,
                    releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString() : null,
                    description: game.summary,
                    publisher: (_j = game.publisher) === null || _j === void 0 ? void 0 : _j.name,
                    developer: (_k = game.developer) === null || _k === void 0 ? void 0 : _k.name,
                    price: game.price || 59.99
                };
                res.json(formattedGame);
            }
            else {
                res.status(404).json({ message: 'Game not found in IGDB' });
            }
        }
        catch (error) {
            console.error('Error fetching from IGDB:', error);
            res.status(500).json({
                message: 'Error fetching game from IGDB',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    catch (error) {
        console.error('Error fetching game details:', error);
        res.status(500).json({
            message: 'Error fetching game details',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
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
    getGameDetails,
};
