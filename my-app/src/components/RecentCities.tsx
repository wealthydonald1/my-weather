import { View, Text, Pressable, StyleSheet } from "react-native";

export function RecentCities({
  cities,
  onSelect,
  theme,
}: {
  cities: string[];
  onSelect: (city: string) => void;
  theme?: "light" | "dark";
}) {
  const isDark = theme === "dark";

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: isDark ? "#fff" : "#111" }]}>
        Recent Cities
      </Text>

      <View style={styles.row}>
        {cities.map((city) => (
          <Pressable
            key={city}
            onPress={() => onSelect(city)}
            style={[
              styles.pill,
              {
                backgroundColor: isDark ? "#111" : "#f0f0f0",
                borderColor: isDark ? "#222" : "#ddd",
              },
            ]}
          >
            <Text style={{ color: isDark ? "#fff" : "#111" }}>{city}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  title: { fontSize: 14, fontWeight: "800" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
});
