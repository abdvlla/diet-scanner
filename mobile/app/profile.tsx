import { useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";

const Profile = () => {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
    }, []),
  );

  return (
    <View>
      <Text>Profile</Text>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({});
