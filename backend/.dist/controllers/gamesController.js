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
// Configuración del limitador (4 peticiones por segundo)
const limiter = new Bottleneck({
    minTime: 250 // 1000ms / 4 = 250ms entre peticiones
});
export const fetchGameData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Usamos el limitador para cumplir con la cuota de peticiones
        const response = yield limiter.schedule(() => __awaiter(void 0, void 0, void 0, function* () {
            return apicalypse({
                headers: {
                    'Client-ID': 'ja0p1yucvmfuhl8vhrst6fynd2q8gh',
                    'Authorization': 'Bearer 6f4u75u2cnsluaw5m84vqfq88oitoa',
                },
            })
                // Especificamos únicamente los campos que necesitamos
                .fields('name, cover')
                // Por ejemplo, si queremos obtener varios juegos, podemos eliminar la cláusula where
                .limit(10)
                .request('https://api.igdb.com/v4/games');
        }));
        console.log('Datos obtenidos:', response.data);
        return response.data;
    }
    catch (err) {
        console.error('Error al obtener datos:');
        if (err instanceof Error) {
            console.error(err.message);
        }
        else {
            console.error('Error desconocido:', err);
        }
        if (isApiError(err) && err.status === 429) {
            console.log('Reintentando...');
            setTimeout(fetchGameData, 1000);
        }
        return null;
    }
});
// Type Guard personalizado
function isApiError(error) {
    return typeof error === 'object' && error !== null && 'status' in error;
}
