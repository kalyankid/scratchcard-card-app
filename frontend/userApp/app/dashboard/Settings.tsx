// app/dashboard/Settings.tsx
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../../theme/theme"; // ← ADD THIS
import Footer from "@/components/Footer";
import { useRouter } from "expo-router";


const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export default function Settings() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [banners, setBanners] = useState<string[]>([]);
  const router = useRouter();


   const { primary, isDark } = useTheme(); 
    const bgColor = isDark ? "#000" : "#fff";

  // Password Update
  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      return Alert.alert("Error", "All fields are required");
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match");
    }
    if (newPassword.length < 6) {
      return Alert.alert("Error", "Password must be at least 6 characters");
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return Alert.alert("Error", "You are not logged in");

      const res = await fetch(`${BASE_URL}/api/auth/update-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed to update password");
      } else {
        Alert.alert("Success", data.message || "Password updated successfully");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error("Update password error:", err);
      Alert.alert("Error", "Something went wrong. Check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch existing banners on mount
  useEffect(() => {
    const fetchBanners = async () => {
      const token = await AsyncStorage.getItem("authToken");
      try {
        const res = await fetch(`${BASE_URL}/api/dashboard/banner`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setBanners(data.banners);
      } catch (err) {
        console.error("Failed to fetch banners:", err);
      }
    };
    fetchBanners();
  }, []);

  // Pick image from gallery
  const pickBanner = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Error", "Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      uploadBanner(result.assets[0].uri);
    }
  };

  // Upload banner
  const uploadBanner = async (uri: string) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Not logged in");
        return;
      }

      const filename = uri.split("/").pop() ?? `banner_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      const cleanUri = Platform.OS === "ios" ? uri.replace("file://", "") : uri;

      const formData = new FormData();
      formData.append("banner", {
        uri: cleanUri,
        name: filename,
        type,
      } as any);

      const res = await fetch(`${BASE_URL}/api/dashboard/banner`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Server returned HTML:", text);
        Alert.alert("Error", "Server error. Check internet or contact support.");
        return;
      }

      if (res.ok) {
        setBanners(data.banners);
        Alert.alert("Success", data.message || "Banner uploaded!");
      } else {
        Alert.alert("Error", data.message || "Upload failed");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Error", err.message || "Upload failed. Try again.");
    }
  };

  // Remove banner
  const removeBanner = async (index: number) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const bannerToRemove = banners[index];

      const res = await fetch(`${BASE_URL}/api/dashboard/banner`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: bannerToRemove }),
      });

      const data = await res.json();

      if (res.ok) {
        const updatedBanners = banners.filter((_, i) => i !== index);
        setBanners(updatedBanners);
        Alert.alert("Success", "Banner removed successfully");
      } else {
        Alert.alert("Error", data.message || "Failed to remove banner");
      }
    } catch (err) {
      console.error("Remove banner error:", err);
      Alert.alert("Error", "Something went wrong. Try again.");
    }
  };

  return (
  <View style={{ flex: 1, backgroundColor: "#000" }}>
    <ScrollView
      style={[styles.container, { backgroundColor: bgColor }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Update Password Section */}
      <View style={styles.header}>
  <Ionicons
    name="arrow-back"
    size={28}
    color={primary}
    onPress={() => router.back()}
  />
  <Text style={[styles.headerTitle, { color: primary }]}>Update Password</Text>
  <View style={{ width: 28 }} /> 
</View>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#999"
          secureTextEntry={!showNewPassword}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowNewPassword((prev) => !prev)}
        >
          <Ionicons
            name={showNewPassword ? "eye" : "eye-off"}
            size={24}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          placeholderTextColor="#999"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowConfirmPassword((prev) => !prev)}
        >
          <Ionicons
            name={showConfirmPassword ? "eye" : "eye-off"}
            size={24}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: primary }, loading && { opacity: 0.7 }]}
        onPress={handleUpdatePassword}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {loading ? "Updating..." : "Update Password"}
        </Text>
      </TouchableOpacity>

      {/* Separator */}
      <View style={styles.sectionSeparator} />

      {/* Manage Banners Section */}
      <Text style={[styles.title, { color: primary }]}>Manage Banners</Text>

      {banners.length > 0 ? (
        <View style={styles.bannerContainer}>
          <Text style={[styles.subtitle, { color: primary }]}>
            Uploaded Banners
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.bannerScroll}
          >
            {banners.map((uri, idx) => (
              <View key={idx} style={styles.bannerWrapper}>
                <Image source={{ uri }} style={styles.bannerImage} />
                <TouchableOpacity
                  style={styles.removeBannerBtn}
                  onPress={() => removeBanner(idx)}
                >
                  <Ionicons name="close-circle" size={24} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <Text style={styles.noBannersText}>No banners uploaded yet</Text>
      )}

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: primary }]}
        onPress={pickBanner}
      >
        <Text style={styles.btnText}>Upload Banner</Text>
      </TouchableOpacity>
    </ScrollView>

    
    <View>
      <Footer />
    </View>
  </View>
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#000",
  },
  contentContainer: {
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    marginTop: 10,
    textAlign: "center",
  },
  header: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 24,
  paddingHorizontal: 4,
  marginTop:10
},
headerTitle: {
  fontSize: 24,
  fontWeight: "bold",
  textAlign: "center",
},

  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#111",
    fontSize: 16,
    color: "#fff",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
  },
  btn: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: "#444",
    marginVertical: 24,
  },
  bannerContainer: {
    marginBottom: 16,
  },
  bannerScroll: {
    paddingVertical: 8,
  },
  bannerWrapper: {
    position: "relative",
    marginRight: 12,
  },
  bannerImage: {
    width: 120,
    height: 70,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
  },
  removeBannerBtn: {
    position: "absolute",
    top: -10,
    right: -10,
  },
  noBannersText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 16,
  },
});