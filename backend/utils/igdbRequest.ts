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

export const igdbRequest = async (query: string) => {
    const clientId = process.env.IGDB_CLIENT_ID;
    const accessToken = process.env.IGDB_ACCESS_TOKEN;

    if (!clientId || !accessToken) {
        throw new Error('IGDB credentials not found in environment variables');
    }

    try {
        const response = await limiter.schedule(() => 
            axiosInstance.post('https://api.igdb.com/v4/games', query, {
                headers: {
                    'Client-ID': clientId,
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'text/plain'
                }
            })
        );

        return response;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('IGDB API Error:', {
                status: error.response?.status,
                data: error.response?.data,
                query: query
            });
        }
        throw error;
    }
}; 