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
 * Genera un precio determinístico basado en el ID de juego
 */
const generatePrice = (gameId) => {
    const seed = gameId * 31;
    const min = 9.99;
    const max = 29.99;
    const random = Math.abs(Math.sin(seed)) * (max - min) + min;
    return Math.round(random * 100) / 100;
};
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
    return cover.replace('t_cover_big', 't_screenshot_big');
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
        price: typeof game.price === 'number'
            ? game.price
            : generatePrice(game.id),
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
export const searchGamesOptimized = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let searchQuery = `
      search "${query}";
      fields id,name,cover.image_id;
      where category = (0, 2, 4, 8, 9);
      limit 5;
    `;
        let { data } = yield igdbRequest(searchQuery);
        if (!data || data.length === 0) {
            const keywords = query.split(':')[0];
            searchQuery = `
        search "${keywords}";
        fields id,name,cover.image_id;
        where name ~ *"${keywords}"* & name ~ *"Breath of the Wild"*;
        limit 5;
      `;
            ({ data } = yield igdbRequest(searchQuery));
        }
        if (!data || data.length === 0) {
            searchQuery = `
        fields id,name,cover.image_id;
        where name ~ *"Zelda"* & name ~ *"Breath"*;
        limit 5;
      `;
            ({ data } = yield igdbRequest(searchQuery));
        }
        return (data === null || data === void 0 ? void 0 : data.map(transformGame)) || [];
    }
    catch (err) {
        console.error('Error en búsqueda optimizada:', err);
        return undefined;
    }
});
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
        return data
            .map(transformGame)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    catch (err) {
        console.error('Error al obtener datos de juegos:', err);
        return undefined;
    }
});
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
export const fetchGameById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = `
      fields id,name,cover.image_id,aggregated_rating,first_release_date;
      where id = ${id};
    `;
        const { data } = yield igdbRequest(query);
        if (!data.length)
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
export const addGameToCartByName = (gameName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const games = yield searchGamesOptimized(gameName);
        if (!games || !games.length)
            return false;
        const bestMatch = games.find(g => g.title.toLowerCase().includes(gameName.toLowerCase())) || games[0];
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (!cart.some(item => item.id === bestMatch.id)) {
            cart.push(bestMatch);
            localStorage.setItem('cart', JSON.stringify(cart));
            return true;
        }
        return false;
    }
    catch (_a) {
        return false;
    }
});
export const removeFromCart = (gameId) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    localStorage.setItem('cart', JSON.stringify(cart.filter(g => g.id !== gameId)));
};
export const getCartItems = () => JSON.parse(localStorage.getItem('cart') || '[]');
export const clearCart = () => localStorage.removeItem('cart');
export const testIGDBConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = yield igdbRequest(`fields id,name; limit 1;`);
        return status === 200;
    }
    catch (_b) {
        return false;
    }
});
export const cacheGameInDatabase = (game) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    try {
        const gameId = parseInt(game.id);
        // Validate required fields
        if (!game.name)
            throw new Error('Game name is required');
        // Check if already exists
        const [existing] = yield pool.query('SELECT idGame FROM games WHERE idGame = ?', [gameId]);
        if (!existing.length) {
            const priceValue = typeof game.price === 'number'
                ? game.price
                : generatePrice(gameId);
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
                ((_c = game.publisher) === null || _c === void 0 ? void 0 : _c.name) || null,
                ((_d = game.developer) === null || _d === void 0 ? void 0 : _d.name) || null,
                game.summary || null,
                priceValue,
                1
            ]);
        }
    }
    catch (error) {
        console.error('Error caching game:', error);
        throw error;
    }
});
export const getGameDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f, _g, _h, _j;
    try {
        const id = parseInt(req.params.id);
        const [rows] = yield pool.query('SELECT * FROM games WHERE idGame = ?', [id]);
        if (rows.length) {
            const g = rows[0];
            return res.json({
                id: g.idGame,
                title: g.name,
                cover: g.cover,
                sliderImage: g.screenshots,
                releaseDate: g.releaseDate,
                description: g.description,
                publisher: g.publisher,
                developer: g.developer,
                price: g.price,
            });
        }
        const query = `
      fields id,name,first_release_date,summary,cover.image_id,screenshots.image_id,publisher.name,developer.name,price;
      where id = ${id};
    `;
        const { data } = yield igdbRequest(query);
        if (!data.length) {
            return res.status(404).json({ message: 'Game not found in IGDB' });
        }
        const game = data[0];
        const priceValue = typeof game.price === 'number'
            ? game.price
            : generatePrice(id);
        yield cacheGameInDatabase(game);
        res.json({
            id,
            title: game.name,
            cover: ((_e = game.cover) === null || _e === void 0 ? void 0 : _e.image_id)
                ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
                : null,
            sliderImage: ((_g = (_f = game.screenshots) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.image_id)
                ? `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${game.screenshots[0].image_id}.jpg`
                : null,
            releaseDate: game.first_release_date
                ? new Date(game.first_release_date * 1000).toISOString()
                : null,
            description: game.summary,
            publisher: (_h = game.publisher) === null || _h === void 0 ? void 0 : _h.name,
            developer: (_j = game.developer) === null || _j === void 0 ? void 0 : _j.name,
            price: priceValue,
        });
    }
    catch (err) {
        console.error('Error fetching game details:', err);
        res.status(500).json({
            message: 'Error fetching game details',
            error: err.message || 'Unknown error',
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
