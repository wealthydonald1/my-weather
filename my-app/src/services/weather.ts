import type { WeatherData } from "../types/weather";

export async function fetchWeather(opts: {
  cityName: string;
  country?: string;
  lat: number;
  lon: number;
  timezone: string;
}): Promise<WeatherData> {
  const { cityName, country, lat, lon, timezone } = opts;

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,wind_speed_10m` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max` +
    `&timezone=${encodeURIComponent(timezone)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch weather");

  const data = await res.json();

  const daily: WeatherData["daily"] = (data.daily?.time ?? [])
    .slice(0, 7)
    .map((date: string, i: number) => ({
      date,
      tempMax: data.daily.temperature_2m_max[i],
      tempMin: data.daily.temperature_2m_min[i],
      windMax: data.daily.wind_speed_10m_max[i],
      weatherCode: data.daily.weather_code[i],
    }));

  return {
    cityLabel: country ? `${cityName}, ${country}` : cityName,
    timezone: data.timezone ?? timezone,
    current: {
      temp: data.current?.temperature_2m ?? 0,
      windSpeed: data.current?.wind_speed_10m ?? 0,
      weatherCode: data.current?.weather_code ?? 0,
    },
    daily,
  };
}
