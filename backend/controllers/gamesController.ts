import apicalypse from 'apicalypse';
import Bottleneck from 'bottleneck';

// Configuración del limitador (4 peticiones por segundo)
const limiter = new Bottleneck({
  minTime: 250 // 1000ms / 4 = 250ms entre peticiones
});

export const fetchGameData = async () => {
  try {
    // Envuelve la petición en el limitador
    const response = await limiter.schedule(async () => {
      return apicalypse({
        headers: {
          'Client-ID': 'ja0p1yucvmfuhl8vhrst6fynd2q8gh',
          'Authorization': 'Bearer 6f4u75u2cnsluaw5m84vqfq88oitoa',
        },
      })
      .fields('*')
      .where('id = 1942')
      .request('https://api.igdb.com/v4/games');
    });

    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error('Error al obtener datos:');

    // Verificar primero si es una instancia de Error
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error('Error desconocido:', err);
    }

    // Verificar si es un error de tasa limitada (status 429)
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