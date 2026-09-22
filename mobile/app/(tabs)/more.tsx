import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Href, useFocusEffect, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

function ContentItem({
  icon,
  name,
  description,
  route,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  name: string;
  description: string;
  route: Href;
}) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.6}
      onPress={() => router.push(route)}
    >
      <MaterialIcons
        name={icon}
        size={24}
        color="#141414"
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color="#141414" />
    </TouchableOpacity>
  );
}

const More = () => {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("dark");
    }, []),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>More</Text>
      <ContentItem
        icon="person"
        name="Account"
        description="View account or make changes"
        route="/profile"
      />
      <ContentItem
        icon="block"
        name="Dietary Restrictions"
        description="Add or change your dietary restrictions"
        route="/dietary-restrictions"
      />
    </View>
  );
};

export default More;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 40,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#141414",
    marginBottom: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E3DC", // subtle rule, not full 3-4px section divider
  },
  icon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1, // pushes chevron to far right regardless of text length
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: "#141414",
  },
  description: {
    fontSize: 13,
    color: "#6B6B6B",
    marginTop: 2,
  },
});
