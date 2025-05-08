var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from 'axios';
import Bottleneck from 'bottleneck';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });
// Create a rate limiter
const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 250 // 4 requests per second
});
// Create axios instance with timeout
const axiosInstance = axios.create({
    timeout: 10000
});
export const igdbRequest = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const clientId = process.env.IGDB_CLIENT_ID;
    const accessToken = process.env.IGDB_ACCESS_TOKEN;
    if (!clientId || !accessToken) {
        throw new Error('IGDB credentials not found in environment variables');
    }
    try {
        const response = yield limiter.schedule(() => axiosInstance.post('https://api.igdb.com/v4/games', query, {
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'text/plain'
            }
        }));
        return response;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('IGDB API Error:', {
                status: (_a = error.response) === null || _a === void 0 ? void 0 : _a.status,
                data: (_b = error.response) === null || _b === void 0 ? void 0 : _b.data,
                query: query
            });
        }
        throw error;
    }
});
