import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { WeatherData } from "../types/weather";
import { codeToEmoji, codeToLabel } from "../utils/weatherCode";

export function TodayCard({ data, theme }: { data: WeatherData; theme?: "light" | "dark" }) {
  const isDark = theme === "dark";
  const cardBg = isDark ? "#111" : "#fff";
  const border = isDark ? "#222" : "#eee";
  const text = isDark ? "#fff" : "#111";
  const sub = isDark ? "#cfcfcf" : "#444";
  const meta = isDark ? "#bdbdbd" : "#555";

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
      <Text style={[styles.city, { color: text }]}>{data.cityLabel}</Text>

      <View style={styles.row}>
        <Text style={styles.icon}>{codeToEmoji(data.current.weatherCode)}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.temp, { color: text }]}>{Math.round(data.current.temp)}°</Text>
          <Text style={{ color: sub }}>{codeToLabel(data.current.weatherCode)}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={{ color: meta }}>Wind: {Math.round(data.current.windSpeed)} km/h</Text>
        <Text style={{ color: meta }}>TZ: {data.timezone}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  city: { fontSize: 16, fontWeight: "800" },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  icon: { fontSize: 48 },
  temp: { fontSize: 42, fontWeight: "900" },
  metaRow: { flexDirection: "row", justifyContent: "space-between" },
});
