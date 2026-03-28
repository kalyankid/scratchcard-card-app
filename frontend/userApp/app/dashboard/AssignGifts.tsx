// app/dashboard/AssignGifts.tsx
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Switch,
  Image,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../theme/theme"; // ← ADD THIS
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";


type Gift = {
  name: string;
  quantity: number;
  image?: string | null;
};

type Assignment = {
  _id: string;
  gifts: Gift[];
  assignedCount: number;
  assignedAt: string;
};

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export default function AssignGifts() {
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [localGifts, setLocalGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(false);
  const [previousAssignments, setPreviousAssignments] = useState<Assignment[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [totalCards, setTotalCards] = useState(0);
  const [isReassign, setIsReassign] = useState(false);

  const router = useRouter();
  const { purchaseId } = useLocalSearchParams();
   const { primary, isDark } = useTheme(); 
    const bgColor = isDark ? "#000" : "#fff"; 

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Need gallery access");
      }
    })();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!purchaseId) return;
      try {
        const token = await AsyncStorage.getItem("authToken");
        const purchaseRes = await axios.get<{ totalCards: number }>(
          `${BASE_URL}/api/purchase/${purchaseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTotalCards(purchaseRes.data.totalCards);

        const historyRes = await axios.get<Assignment[]>(
          `${BASE_URL}/api/gifts/history`,
          { params: { purchaseId }, headers: { Authorization: `Bearer ${token}` } }
        );
        setPreviousAssignments(historyRes.data);
      } catch (e) {
        console.error("Load error:", e);
      } finally {
        setLoadingHistory(false);
      }
    };
    load();
  }, [purchaseId]);

  const pickImageForGift = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      const newGifts = [...localGifts];
      newGifts[index].image = result.assets[0].uri;
      setLocalGifts(newGifts);
    }
  };

  const addLocal = () => {
    const quantity = parseInt(qty) || 0;
    if (!name.trim() || quantity < 1) {
      Alert.alert("Error", "Enter valid name and quantity");
      return;
    }
    setLocalGifts([...localGifts, { name: name.trim(), quantity, image: null }]);
    setName("");
    setQty("");
  };

  const removeLocal = (i: number) => {
    setLocalGifts(localGifts.filter((_, idx) => idx !== i));
  };

  const totalAssigned = localGifts.reduce((sum, g) => sum + g.quantity, 0);
  const canSubmit = totalAssigned === totalCards && totalAssigned > 0;

  const submit = async (mode: "add" | "reassign") => {
    if (!canSubmit) return;
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("No token");

      const formData = new FormData();
      formData.append("purchaseId", purchaseId as string);
      formData.append("mode", mode);
      formData.append("fillFallback", "false");

      localGifts.forEach((gift, i) => {
        formData.append(`gifts[${i}][name]`, gift.name);
        formData.append(`gifts[${i}][quantity]`, gift.quantity.toString());

        if (gift.image) {
          const filename = gift.image.split("/").pop() || `gift-${i}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : "image/jpeg";

          formData.append(`images[${i}]`, {
            uri: gift.image,
            name: filename,
            type,
          } as any);
        }
      });

      const res = await axios.post<{ assignCount: number }>(
        `${BASE_URL}/api/gifts/assign`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert(
        "Success",
        `${mode === "reassign" ? "Reassigned" : "Assigned"} ${res.data.assignCount} cards!`,
        [{ text: "OK", onPress: () => router.back() }]
      );

      setLocalGifts([]);
      setIsReassign(false);

      const historyRes = await axios.get<Assignment[]>(
        `${BASE_URL}/api/gifts/history`,
        { params: { purchaseId }, headers: { Authorization: `Bearer ${token}` } }
      );
      setPreviousAssignments(historyRes.data);
    } catch (e: any) {
      console.error("Assign error:", e.response?.data || e);
      Alert.alert("Error", e.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[s.container, { backgroundColor: bgColor }]}>
       <View style={s.header}>
    <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
      <Ionicons name="arrow-back" size={28} color={primary} />
    </TouchableOpacity>
    <Text style={[s.title, { color: primary }]}>Assign Gifts</Text>
  </View>
      <Text style={s.totalCards}>Total Cards: {totalCards}</Text>

      <TextInput style={s.input} placeholder="Gift name" value={name} onChangeText={setName} />
      <TextInput style={s.input} placeholder="Quantity" value={qty} keyboardType="numeric" onChangeText={setQty} />

      <TouchableOpacity style={[s.addBtn, { backgroundColor: primary }]} onPress={addLocal}>
        <Text style={s.addBtnTxt}>+ Add Gift</Text>
      </TouchableOpacity>

      {/* Gift List with Image Upload */}
      {localGifts.map((g, i) => (
        <View key={i} style={s.giftRow}>
          <View style={s.giftInfo}>
            <Text style={s.giftName}>{g.name}</Text>
            <Text style={s.giftQty}>Qty: {g.quantity}</Text>
          </View>

          {g.image ? (
            <View style={s.imagePreview}>
              <Image source={{ uri: g.image }} style={s.giftImage} />
              <TouchableOpacity
                onPress={() => {
                  const newGifts = [...localGifts];
                  newGifts[i].image = null;
                  setLocalGifts(newGifts);
                }}
              >
                <Text style={s.remove}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={s.uploadBtnSmall} onPress={() => pickImageForGift(i)}>
              <Text style={s.uploadTxtSmall}>+ Upload Image</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => removeLocal(i)} style={s.deleteBtn}>
            <Text style={s.deleteTxt}>X</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={s.totalRow}>
        <Text style={s.totalText}>
          Assigned: <Text style={canSubmit ? s.totalGood : s.totalBad}>{totalAssigned}</Text> / {totalCards}
        </Text>
      </View>

      <TouchableOpacity
        style={[s.submitBtn, { backgroundColor: primary }, !canSubmit && s.disabled]}
        disabled={!canSubmit || loading}
        onPress={() => submit(isReassign ? "reassign" : "add")}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitTxt}>{isReassign ? "Reassign" : "Assign Gifts"}</Text>}
      </TouchableOpacity>

      {/* History */}
      <View style={s.historySection}>
        <Text style={[s.historyTitle, { color: primary }]}>History</Text>
        {loadingHistory ? (
          <Text style={s.loading}>Loading...</Text>
        ) : previousAssignments.length === 0 ? (
          <Text style={s.empty}>No assignments</Text>
        ) : (
          previousAssignments.map((assign) => (
            <View key={assign._id} style={[s.historyCard, { borderLeftColor: primary }]}>
              <Text style={s.historyDate}>{new Date(assign.assignedAt).toLocaleString()}</Text>
              <Text style={[s.historyCount, { color: primary }]}>{assign.assignedCount} cards</Text>
              {assign.gifts.map((g, i) => (
                <Text key={i} style={s.historyGift}>• {g.name}: {g.quantity}</Text>
              ))}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#000" },
  header: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center", // Center the title
  marginBottom: 20,
  marginTop: 10,
  position: "relative", // For absolute positioning of back button
},
backBtn: {
  position: "absolute",
  left: 0, // Stick to left
  padding: 4,
},
title: { 
  fontSize: 24, 
  fontWeight: "bold",
  textAlign: "center",
},

  totalCards: { fontSize: 16, fontWeight: "600", color: "#ccc", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#444", borderRadius: 10, padding: 12, backgroundColor: "#111", marginBottom: 12, fontSize: 15, color: "#fff" },
  addBtn: { padding: 14, borderRadius: 12, alignItems: "center", marginBottom: 16 },
  addBtnTxt: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  giftRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
  },
  giftInfo: { flex: 1 },
  giftName: { fontSize: 15, fontWeight: "600", color: "#fff" },
  giftQty: { fontSize: 13, color: "#aaa" },
  imagePreview: { alignItems: "center", marginRight: 8 },
  giftImage: { width: 50, height: 50, borderRadius: 8 },
  remove: { color: "#e74c3c", fontSize: 12, marginTop: 4 },
  uploadBtnSmall: { backgroundColor: "#333", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8 },
  uploadTxtSmall: { fontSize: 12, color: "#ccc" },
  deleteBtn: { backgroundColor: "#e74c3c", width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  deleteTxt: { color: "#fff", fontWeight: "bold" },

  totalRow: { alignItems: "center", marginVertical: 16 },
  totalText: { fontSize: 16, fontWeight: "600", color: "#ccc" },
  totalGood: { color: "#27ae60" },
  totalBad: { color: "#e74c3c" },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 12 },
  toggleLabel: { fontSize: 15, fontWeight: "500", color: "#ccc" },
  submitBtn: { padding: 16, borderRadius: 12, alignItems: "center", marginTop: 8 },
  disabled: { opacity: 0.5 },
  submitTxt: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  historySection: { marginTop: 32 },
  historyTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  historyCard: { backgroundColor: "#111", padding: 16, borderRadius: 14, marginBottom: 12, elevation: 2, borderLeftWidth: 4 },
  historyDate: { fontSize: 13, color: "#aaa", marginBottom: 4 },
  historyCount: { fontWeight: "bold", marginBottom: 6 },
  historyGift: { marginLeft: 8, color: "#ccc", fontSize: 14 },
  loading: { textAlign: "center", color: "#999", fontStyle: "italic" },
  empty: { textAlign: "center", color: "#999", fontStyle: "italic" },
});