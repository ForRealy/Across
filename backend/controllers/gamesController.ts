import apicalypse from 'apicalypse';
import Bottleneck from 'bottleneck';
import axios from "axios";

// Configuración del limitador (4 peticiones por segundo)
const limiter = new Bottleneck({
  minTime: 250 // 1000ms / 4 = 250ms entre peticiones
});
const axiosInstance = axios.create({
  timeout: 10000 // 10 segundos
});
export const fetchGameData = async () => {
  try { 
    // Usamos el limitador para cumplir con la cuota de peticiones
    const response = await limiter.schedule(async () => {
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
    });

    console.log('Datos obtenidos:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error al obtener datos:');
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error('Error desconocido:', err);
    }
    if (isApiError(err) && err.status === 429) {
      console.log('Reintentando...');
      setTimeout(fetchGameData, 1000);
    }
    return null;
  }
};


// Type Guard personalizado
function isApiError(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}