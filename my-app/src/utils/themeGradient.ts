export function getWeatherGradient(code: number, theme: "light" | "dark") {
  const dark = theme === "dark";

  // Returns [top, bottom]
  // Simple buckets based on Open-Meteo weather codes
  const isClear = code === 0;
  const isPartly = code === 1 || code === 2;
  const isCloudy = code === 3;
  const isFog = code === 45 || code === 48;
  const isDrizzle = code === 51 || code === 53 || code === 55;
  const isRain = code === 61 || code === 63 || code === 65;
  const isSnow = code === 71 || code === 73 || code === 75;
  const isThunder = code === 95 || code === 96 || code === 99;

  if (dark) {
    if (isClear) return ["#0B1220", "#000000"];
    if (isPartly) return ["#0B1A2A", "#000000"];
    if (isCloudy) return ["#0A0F14", "#000000"];
    if (isFog) return ["#0C0C0C", "#000000"];
    if (isDrizzle || isRain) return ["#061A2A", "#000000"];
    if (isSnow) return ["#0D1622", "#000000"];
    if (isThunder) return ["#12061F", "#000000"];
    return ["#0B1220", "#000000"];
  }

  // Light theme gradients
  if (isClear) return ["#CFE9FF", "#FFFFFF"];
  if (isPartly) return ["#D9F0FF", "#FFFFFF"];
  if (isCloudy) return ["#E7EEF5", "#FFFFFF"];
  if (isFog) return ["#EDEDED", "#FFFFFF"];
  if (isDrizzle || isRain) return ["#D8E6F7", "#FFFFFF"];
  if (isSnow) return ["#EEF6FF", "#FFFFFF"];
  if (isThunder) return ["#E9D9FF", "#FFFFFF"];
  return ["#F2F6FF", "#FFFFFF"];
}