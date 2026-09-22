import { useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Halal",
  "Kosher",
  "Dairy-Free",
  "Gluten-Free",
  "Nut-Free",
  "Sugar-Free",
];

export default function DietaryRestrictions() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
    }, []),
  );

  function toggleOption(option: string) {
    setEnabled((prev) => ({ ...prev, [option]: !prev[option] }));
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>
        Select a pre-set option for ingredients to be warned about in a food.
      </Text>
      <View style={styles.thinRule} />
      {DIETARY_OPTIONS.map((option) => (
        <View key={option} style={styles.row}>
          <Text style={styles.rowLabel}>{option}</Text>
          <Switch
            value={!!enabled[option]}
            onValueChange={() => toggleOption(option)}
            trackColor={{ false: "#E5E3DC", true: "#3D7A5C" }}
            thumbColor="#FAFAF7"
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF7" },
  content: { paddingHorizontal: 18, paddingTop: 30, paddingBottom: 60 },
  header: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1.5,
    color: "#141414",
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#141414",
    marginBottom: 8,
  },
  thinRule: {
    height: 1,
    backgroundColor: "#E5E3DC",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E3DC",
    backgroundColor: "#f1efe9",
    borderRadius: 10,
    marginTop: 4,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#141414",
  },
});
