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
export const fetchGameData = async () => {
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
      data: 'fields name,cover;limit 10;'
    });

    console.log('Datos obtenidos:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error al obtener datos:', err);
    return null;
  }
};


// Type Guard personalizado
function isApiError(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}