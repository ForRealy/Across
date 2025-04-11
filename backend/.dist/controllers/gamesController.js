var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import apicalypse from 'apicalypse';
import Bottleneck from 'bottleneck';
import axios from "axios";
// Configuración del limitador (4 peticiones por segundo)
const limiter = new Bottleneck({
    minTime: 250,
    maxRetries: 3, // Máximo de reintentos
});
const axiosInstance = axios.create({
    timeout: 10000 // 10 segundos
});
export const fetchGameData = (retryCount = 0) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const MAX_RETRIES = 3;
    try {
        const response = yield limiter.schedule(() => __awaiter(void 0, void 0, void 0, function* () {
            return apicalypse({
                headers: {
                    'Client-ID': 'ja0p1yucvmfuhl8vhrst6fynd2q8gh',
                    'Authorization': 'Bearer 6f4u75u2cnsluaw5m84vqfq88oitoa',
                },
                axiosInstance: axiosInstance // Usamos la instancia personalizada
            })
                .fields('name, cover')
                .limit(10)
                .request('https://api.igdb.com/v4/games');
        }));
        console.log('Datos obtenidos:', response.data);
        return response.data;
    }
    catch (err) {
        console.error('Error al obtener datos:');
        if (axios.isAxiosError(err)) {
            const status = (_a = err.response) === null || _a === void 0 ? void 0 : _a.status;
            const headers = (_b = err.response) === null || _b === void 0 ? void 0 : _b.headers;
            if (status === 429 && retryCount < MAX_RETRIES) {
                const retryAfter = parseInt((headers === null || headers === void 0 ? void 0 : headers['retry-after']) || '1', 10);
                console.log(`Reintentando en ${retryAfter} segundos... (Intento ${retryCount + 1})`);
                yield new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                return fetchGameData(retryCount + 1);
            }
            console.error(`Error HTTP ${status}: ${err.message}`);
        }
        else if (err instanceof Error) {
            console.error(err.message);
        }
        else {
            console.error('Error desconocido:', err);
        }
        return null;
    }
});
