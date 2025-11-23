// app/screens/map.tsx
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Image, Alert } from "react-native";
import MapView, { Marker, Callout, Circle } from "react-native-maps";
import { supabase } from "../../lib/supabase";

export default function MapScreen() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState({ latitude: 0, longitude: 0, latitudeDelta: 0.05, longitudeDelta: 0.05 });

  const RADIUS_KM = 1;

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    const setupMap = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Enable location to see nearby incidents");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });
      setRegion({ latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });

      const { data: initialIncidents, error } = await supabase.from("incidents").select("*").order("created_at", { ascending: false });
      if (!error) setIncidents(initialIncidents || []);

      const channel = supabase.channel("public:incidents")
        .on("postgres_changes", { event: "*", schema: "public", table: "incidents" }, (payload: any) => {
          setIncidents((prev) => [...prev.filter((i) => i.id !== payload.new.id), payload.new]);
        })
        .subscribe();

      return () => supabase.removeChannel(channel);
    };

    const cleanupPromise = setupMap();
    return () => { cleanupPromise.then((cleanup) => cleanup && cleanup()); };
  }, []);

  const nearbyIncidents = userLocation
    ? incidents.filter((i) => getDistance(userLocation.latitude, userLocation.longitude, i.latitude, i.longitude) <= RADIUS_KM)
    : [];

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} region={region} showsUserLocation>
        {userLocation && <Circle center={userLocation} radius={RADIUS_KM * 1000} strokeColor="rgba(0,150,255,0.5)" fillColor="rgba(0,150,255,0.2)" />}
        {nearbyIncidents.map((i) => (
          <Marker key={i.id} coordinate={{ latitude: i.latitude, longitude: i.longitude }} title={i.title}>
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.title}>{i.title} ({i.status})</Text>
                <Text style={styles.description}>{i.description}</Text>
                {i.photo_url && <Image source={{ uri: i.photo_url }} style={styles.image} />}
                <Text style={styles.date}>{new Date(i.created_at).toLocaleString()}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  callout: { width: 220, padding: 8 },
  title: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  description: { fontSize: 14, marginBottom: 4 },
  image: { width: 200, height: 120, marginBottom: 4, borderRadius: 8 },
  date: { fontSize: 12, color: "#666" },
});
