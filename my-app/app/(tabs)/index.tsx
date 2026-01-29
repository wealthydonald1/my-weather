import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { SearchBar } from "../../src/components/SearchBar";
import { TodayCard } from "../../src/components/TodayCard";
import { WeekForecastList } from "../../src/components/WeekForecastList";
import { RecentCities } from "../../src/components/RecentCities";

import { geocodeCity } from "../../src/services/geocode";
import { fetchWeather } from "../../src/services/weather";
import type { WeatherData } from "../../src/types/weather";

const RECENT_KEY = "recent_cities";
const MAX_RECENT = 5;

export default function WeatherScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const bg = isDark ? "#000" : "#fafafa";
  const text = isDark ? "#fff" : "#111";

  const [query, setQuery] = useState("Lagos");
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);

  async function loadRecent() {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    if (raw) setRecent(JSON.parse(raw));
  }

  async function saveRecent(city: string) {
    const next = [city, ...recent.filter((c) => c !== city)].slice(0, MAX_RECENT);
    setRecent(next);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
  }

  async function loadCity(city: string) {
    const trimmed = city.trim();
    if (!trimmed) return;

    setLoading(true);
    setErr(null);

    try {
      const g = await geocodeCity(trimmed);
      const w = await fetchWeather({
        cityName: g.name,
        country: g.country,
        lat: g.latitude,
        lon: g.longitude,
        timezone: g.timezone,
      });
      setData(w);
      saveRecent(w.cityLabel);
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecent();
    loadCity("Lagos");
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg }} contentContainerStyle={styles.page}>
      <Text style={[styles.h1, { color: text }]}>Weather</Text>

      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={() => loadCity(query)}
        disabled={loading}
        theme={isDark ? "dark" : "light"}
      />

      {recent.length > 0 && (
        <RecentCities
          cities={recent}
          onSelect={(city) => {
            setQuery(city);
            loadCity(city);
          }}
          theme={isDark ? "dark" : "light"}
        />
      )}

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: text }}>Loading forecast…</Text>
        </View>
      )}

      {err && <Text style={[styles.error, { color: "#ff5a5f" }]}>⚠️ {err}</Text>}

      {data && !loading && (
        <View style={{ gap: 14 }}>
          <TodayCard data={data} theme={isDark ? "dark" : "light"} />
          <WeekForecastList data={data} theme={isDark ? "dark" : "light"} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 14, flexGrow: 1 },
  h1: { fontSize: 28, fontWeight: "900" },
  center: { paddingVertical: 20, alignItems: "center" },
  error: { fontWeight: "700" },
});
