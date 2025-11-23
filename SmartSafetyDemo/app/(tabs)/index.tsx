// app/index.tsx
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Safety Demo</Text>

      <Button title="Report Incident" onPress={() => router.push("../report")} />
      <Button title="Live Map" onPress={() => router.push("../map")} />
      <Button title="Recent Alerts" onPress={() => router.push("../feed")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 24 },
});

