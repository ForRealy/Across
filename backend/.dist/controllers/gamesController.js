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
export const fetchGameData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!process.env.IGDB_CLIENT_ID || !process.env.IGDB_AUTHORIZATION) {
            throw new Error('Las credenciales de IGDB no están configuradas correctamente');
        }
        const response = yield axios({
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
    }
    catch (err) {
        console.error('Error al obtener datos:', err);
        return null;
    }
});
// Type Guard personalizado
function isApiError(error) {
    return typeof error === 'object' && error !== null && 'status' in error;
}
