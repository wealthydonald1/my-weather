import React from "react";
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";

export function SearchBar(props: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  theme?: "light" | "dark";
}) {
  const isDark = props.theme === "dark";

  return (
    <View style={styles.row}>
      <TextInput
        value={props.value}
        onChangeText={props.onChange}
        placeholder="Search city (e.g. Lagos)"
        placeholderTextColor={isDark ? "#9aa0a6" : "#777"}
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#111" : "#fff",
            borderColor: isDark ? "#222" : "#e5e5e5",
            color: isDark ? "#fff" : "#111",
          },
        ]}
        editable={!props.disabled}
        returnKeyType="search"
        onSubmitEditing={props.onSubmit}
      />
      <Pressable
        onPress={props.onSubmit}
        disabled={props.disabled}
        style={[styles.btn, props.disabled && { opacity: 0.6 }]}
      >
        <Text style={styles.btnText}>Go</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  btn: {
    backgroundColor: "#111",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
