import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { WeatherData } from "../types/weather";
import { codeToEmoji, dayName } from "../utils/weatherCode";

export function WeekForecastList({
  data,
  theme,
}: {
  data: WeatherData;
  theme?: "light" | "dark";
}) {
  const isDark = theme === "dark";
  const cardBg = isDark ? "#111" : "#fff";
  const border = isDark ? "#222" : "#eee";
  const text = isDark ? "#fff" : "#111";
  const sub = isDark ? "#cfcfcf" : "#555";

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
      <Text style={[styles.title, { color: text }]}>This Week</Text>

      {data.daily.slice(0, 7).map((d) => (
        <View key={d.date} style={styles.row}>
          <Text style={[styles.day, { color: text }]}>{dayName(d.date)}</Text>
          <Text style={styles.icon}>{codeToEmoji(d.weatherCode)}</Text>
          <Text style={[styles.mid, { color: sub }]}>
            {Math.round(d.tempMax)}° / {Math.round(d.tempMin)}°
          </Text>
          <Text style={[styles.wind, { color: sub }]}>{Math.round(d.windMax)} km/h</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  title: { fontSize: 16, fontWeight: "900" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  day: { width: 56, fontWeight: "800" },
  icon: { width: 34, fontSize: 18 },
  mid: { flex: 1 },
  wind: { width: 90, textAlign: "right" },
});
