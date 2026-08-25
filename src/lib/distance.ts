export const STORE_COORDS = {
  lat: -15.8135,
  lng: -48.1127,
};

const RADIUS_KM = 15;
const CACHE_TTL = 24 * 60 * 60 * 1000;

const cache = new Map<string, { lat: number; lng: number; ts: number }>();

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocodeCep(
  cep: string,
): Promise<{ lat: number; lng: number } | null> {
  const clean = cep.replace(/\D/g, "");
  if (clean.length !== 8) return null;

  const cached = cache.get(clean);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return { lat: cached.lat, lng: cached.lng };
  }

  try {
    const viaCepRes = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    const viaCepData = await viaCepRes.json();
    if (viaCepData.erro) return null;

    const query = `${viaCepData.logradouro}, ${viaCepData.bairro}, ${viaCepData.localidade}, ${viaCepData.uf}, Brazil`;
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { "User-Agent": "VizionStore/1.0" } },
    );
    const nomData = await nomRes.json();

    if (nomData.length > 0) {
      const coords = {
        lat: parseFloat(nomData[0].lat),
        lng: parseFloat(nomData[0].lon),
      };
      cache.set(clean, { ...coords, ts: Date.now() });
      return coords;
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }

  return null;
}

export async function getDistanceFromStore(
  cep: string,
): Promise<number | null> {
  const targetCoords = await geocodeCep(cep);
  if (!targetCoords) return null;

  return haversineDistance(
    STORE_COORDS.lat,
    STORE_COORDS.lng,
    targetCoords.lat,
    targetCoords.lng,
  );
}

export async function isWithinFreeDeliveryRadius(
  cep: string,
): Promise<boolean> {
  const distance = await getDistanceFromStore(cep);
  if (distance === null) return false;
  return distance <= RADIUS_KM;
}
