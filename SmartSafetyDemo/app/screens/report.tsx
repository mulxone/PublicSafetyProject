// app/screens/report.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as FileSystem from "expo-file-system/legacy";
import { Buffer } from "buffer";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";

export default function ReportScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const locationStatus = await Location.requestForegroundPermissionsAsync();
      if (
        cameraStatus.status !== "granted" ||
        libraryStatus.status !== "granted" ||
        locationStatus.status !== "granted"
      ) {
        Alert.alert(
          "Permissions required",
          "Camera, media library, and location permissions are required to report incidents."
        );
      }
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      quality: 1,
      exif: true,
    });
    if (!result.canceled && result.assets[0]) setImage(result.assets[0]);
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
      exif: true,
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0]);

      // Get device location
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    }
  };

  const uploadImage = async (uri: string) => {
    const fileExt = uri.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" });
    const blob = Buffer.from(base64, "base64");

    const { error } = await supabase.storage.from("incidents").upload(fileName, blob, {
      contentType: "image/jpeg",
      upsert: true,
    });
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from("incidents").getPublicUrl(fileName);
    return publicUrl;
  };

  const submitReport = async () => {
    if (!image) {
      Alert.alert("Error", "Please pick or take an image first");
      return;
    }
    setUploading(true);
    try {
      // Use EXIF GPS if available, otherwise fallback to device location
      let latitude = image.exif?.GPSLatitude ?? location?.latitude ?? 0;
      let longitude = image.exif?.GPSLongitude ?? location?.longitude ?? 0;
      if (Array.isArray(latitude)) latitude = latitude[0];
      if (Array.isArray(longitude)) longitude = longitude[0];

      const photo_url = await uploadImage(image.uri);

      const { error } = await supabase.from("incidents").insert([
        { title, description, photo_url, latitude, longitude, status: "pending" },
      ]);

      if (error) throw error;

      Alert.alert("Success", "Incident submitted!");
      setTitle("");
      setDescription("");
      setImage(null);
      setLocation(null);

      // Go back to feed or home
      router.push("/"); 
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Report Incident</Text>

      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.textArea]}
        multiline
        numberOfLines={4}
      />

      {image && <Image source={{ uri: image.uri }} style={{ width: 200, height: 200, marginBottom: 10 }} />}

      <View style={{ marginBottom: 10 }}>
        <Button title="Pick from Library" onPress={pickImage} />
        <Button title="Take Photo" onPress={takePhoto} />
      </View>

      <Button
        title={uploading ? "Uploading..." : "Submit Report"}
        onPress={submitReport}
        disabled={uploading}
      />
      {uploading && <ActivityIndicator size="large" color="green" style={{ marginTop: 10 }} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, alignItems: "center" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 16, width: "100%" },
  textArea: { height: 100, textAlignVertical: "top" },
});
