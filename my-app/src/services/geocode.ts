export type GeocodeResult = {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export async function geocodeCity(city: string): Promise<GeocodeResult> {
  const q = encodeURIComponent(city.trim());
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=1&language=en&format=json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to find city");

  const data = await res.json();
  const first = data?.results?.[0];
  if (!first) throw new Error("City not found");

  return {
    name: first.name,
    country: first.country,
    latitude: first.latitude,
    longitude: first.longitude,
    timezone: first.timezone ?? "auto",
  };
}
