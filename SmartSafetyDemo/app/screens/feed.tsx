
// app/screens/feed.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
import { supabase } from "../../lib/supabase";

interface Incident {
  id: string;
  title: string;
  description: string;
  photo_url?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  created_at?: string;
}

export default function FeedScreen() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      const { data } = await supabase.from("incidents").select("*").order("created_at", { ascending: false });
      setIncidents(data || []);
    };
    fetchIncidents();
  }, []);

  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleString() : "";

  return (
    <FlatList
      data={incidents}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.item}>
          {item.photo_url && <Image source={{ uri: item.photo_url }} style={styles.image} />}
          <View style={styles.content}>
            <Text style={styles.title}>{item.title} ({item.status})</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.location}>
              {item.latitude && item.longitude ? `Location: ${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}` : "Location: N/A"}
            </Text>
            <Text style={styles.date}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: "row", padding: 12, borderBottomWidth: 1, borderColor: "#ddd" },
  image: { width: 80, height: 80, marginRight: 12, borderRadius: 8 },
  content: { flex: 1 },
  title: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  description: { fontSize: 14, marginBottom: 4 },
  location: { fontSize: 12, color: "#555", marginBottom: 2 },
  date: { fontSize: 12, color: "#888" },
});
