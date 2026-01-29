export type WeatherData = {
  cityLabel: string;
  timezone: string;

  current: {
    temp: number;
    windSpeed: number;
    weatherCode: number;
  };

  daily: Array<{
    date: string; // YYYY-MM-DD
    tempMax: number;
    tempMin: number;
    windMax: number;
    weatherCode: number;
  }>;
};
