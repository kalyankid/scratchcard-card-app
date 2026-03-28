// app/dashboard/Purchases.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL?.replace(/\/$/, "");

type Purchase = {
  _id: string;
  offerId: { title: string; price: number };
  totalCards: number;
  createdAt: string;
  status?: "pending" | "verified" | "rejected";
  paymentScreenshot?: string;
};

export default function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const loadPurchases = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Session expired", "Please login again");
        router.replace("/login");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/purchase`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const text = await response.text();
      if (!response.ok) {
        if (response.status === 401) {
          Alert.alert("Session expired", "Logging you out...");
          await AsyncStorage.clear();
          router.replace("/login");
          return;
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = text.trim().startsWith("{") || text.trim().startsWith("[")
        ? JSON.parse(text)
        : [];
      setPurchases(
        data.map((p: Purchase) => ({ ...p, status: p.status || "pending" }))
      );
    } catch (err: any) {
      console.error("Load purchases error:", err);
      Alert.alert("Error", err.message || "Failed to load purchases");
    }
  };

  useEffect(() => {
    loadPurchases();
    const interval = setInterval(loadPurchases, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, []);

  const pickAndUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo library access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      Alert.alert("Not logged in");
      return;
    }

    setUploading(true);
    const uri = result.assets[0].uri;
    const filename = uri.split("/").pop() || `proof_${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    const formData = new FormData();
    formData.append("purchaseId", selectedPurchaseId);
    formData.append("screenshot", {
      uri,
      name: filename,
      type,
    } as any);

    try {
      const response = await fetch(`${BASE_URL}/api/purchase/upload-screenshot`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      if (!response.ok) {
        if (response.status === 401) {
          Alert.alert("Session expired", "Please login again");
          router.replace("/login");
          return;
        }
        throw new Error(text || "Upload failed");
      }

      const json = JSON.parse(text);
      Alert.alert("Success", json.message || "Screenshot uploaded!");
      setModalVisible(false);

      // Update local state so "Screenshot uploaded successfully" appears immediately
      setPurchases((prev) =>
        prev.map((p) =>
          p._id === selectedPurchaseId
            ? { ...p, paymentScreenshot: uri } // store actual URI
            : p
        )
      );
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Upload Failed", err.message || "Try again");
    } finally {
      setUploading(false);
    }
  };

  const openUploadModal = (id: string) => {
    setSelectedPurchaseId(id);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: Purchase }) => {
    const status = item.status || "pending";
    const isVerified = status === "verified";

    return (
      <View style={p.card}>
        <Text style={p.title}>{item.offerId.title}</Text>
        <Text style={p.detail}>Amount: ₹{item.offerId.price}</Text>
        <Text style={p.detail}>Cards: {item.totalCards}</Text>
        <Text style={p.detail}>Date: {new Date(item.createdAt).toLocaleDateString()}</Text>

        <Text
          style={[
            p.status,
            {
              color:
                status === "pending"
                  ? "#ff9500"
                  : status === "verified"
                  ? "#34c759"
                  : "#ff3b30",
            },
          ]}
        >
          Status: {status.toUpperCase()}
        </Text>

        {/* Show "Screenshot uploaded successfully" if screenshot exists */}
        {item.paymentScreenshot && (
          <Text style={{ color: "#34c759", fontWeight: "bold", marginTop: 12 }}>
            Screenshot uploaded successfully
          </Text>
        )}

        {/* Upload Proof button only if screenshot is missing and not verified */}
        {!item.paymentScreenshot && !isVerified && (
          <TouchableOpacity style={p.uploadBtn} onPress={() => openUploadModal(item._id)}>
            <Text style={p.btnText}>Upload Proof</Text>
          </TouchableOpacity>
        )}

        {/* Assign Gifts button only if admin verified */}
        {isVerified && (
          <TouchableOpacity
            style={p.assignBtn}
            onPress={() =>
              router.push({ pathname: "/dashboard/AssignGifts", params: { purchaseId: item._id } })
            }
          >
            <Text style={p.btnText}>Assign Gifts</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={p.container}>
      <TouchableOpacity onPress={() => router.back()} style={p.backButton}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <Text style={p.heading}>My Purchases</Text>

      <FlatList
        data={purchases}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={p.empty}>No purchases yet</Text>}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
  <View style={p.modalOverlay}>
    <View style={p.modal}>
      <Text style={p.modalTitle}>Upload Payment Proof</Text>

      {uploading ? (
        <View style={{ alignItems: "center" }}>
          <ActivityIndicator size="large" color="#0066ff" />
          <Text style={{ marginTop: 16, color: "#666" }}>Uploading...</Text>
        </View>
      ) : (
        <>
          <TouchableOpacity style={p.chooseImageBtn} onPress={pickAndUpload}>
            <Ionicons name="image-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={p.chooseImageText}>Choose Image</Text>
          </TouchableOpacity>

          <TouchableOpacity style={p.cancelBtn} onPress={() => setModalVisible(false)}>
            <Text style={{ color: "#0066ff", fontWeight: "600" }}>Cancel</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  </View>
</Modal>

    </View>
  );
}

const p = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 16 },
  backButton: { padding: 8, marginBottom: 10 },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 6,
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  detail: { fontSize: 16, color: "#333", marginBottom: 4 },
  status: { marginTop: 12, fontSize: 16, fontWeight: "bold" },

  uploadBtn: {
    backgroundColor: "#0066ff",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  assignBtn: {
    backgroundColor: "#34c759",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 20,
    width: "88%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  cancelBtn: { marginTop: 20 },

  // ✅ NEW: visible blue button with text and icon
  chooseImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0066ff",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  chooseImageText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  empty: { textAlign: "center", color: "#aaa", fontSize: 18, marginTop: 80 },
});

