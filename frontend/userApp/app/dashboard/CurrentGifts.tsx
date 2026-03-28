// app/dashboard/CurrentGifts.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useTheme } from "../../theme/theme"; // ← ADD THIS
import Footer from "@/components/Footer";
import { Ionicons } from "@expo/vector-icons"; // add at top
import { useRouter } from "expo-router";   


type Gift = { name: string; quantity: number };

type PurchaseGifts = {
  _id: string;
  offerTitle: string;
  totalCards: number;
  assignedAt: string;
  gifts: Gift[];
};

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export default function CurrentGifts() {
  const router = useRouter();

  const [data, setData] = useState<PurchaseGifts[]>([]);
  const [loading, setLoading] = useState(true);
   const { primary, isDark } = useTheme(); 
    const bgColor = isDark ? "#000" : "#fff";

  const load = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await axios.get<PurchaseGifts[]>(`${BASE_URL}/api/gifts/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (e) {
      console.error("Failed to load gifts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const renderGiftRow = ({ item }: { item: Gift }) => (
    <View style={s.giftRow}>
      <Text style={s.giftName}>{item.name}</Text>
      <Text style={[s.giftQty, { color: primary }]}>{item.quantity} cards</Text>
    </View>
  );

  const renderPurchase = ({ item }: { item: PurchaseGifts }) => (
    <View style={s.purchaseCard}>
      <View style={[s.purchaseHeader, { backgroundColor: primary }]}>
        <Text style={s.offerTitle}>{item.offerTitle}</Text>
        <Text style={s.offerDetails}>
          {item.totalCards} cards • {new Date(item.assignedAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={s.giftsTable}>
        <View style={s.tableHeader}>
          <Text style={s.th}>Gift</Text>
          <Text style={s.th}>Cards</Text>
        </View>
        {item.gifts.map((gift, index) => (
          <View key={index} style={s.giftRow}>
            <Text style={s.giftName}>{gift.name}</Text>
            <Text style={[s.giftQty, { color: primary }]}>{gift.quantity} cards</Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={s.loadingText}>Loading gifts...</Text>
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: bgColor }]}>
      <View style={s.header}>
  <Ionicons
    name="arrow-back"
    size={28}
    color={primary}
    onPress={() => router.back()}
  />
  <Text style={[s.headerTitle, { color: primary }]}>All Assigned Gifts</Text>
  <View style={{ width: 28 }} /> 
</View>

      {data.length === 0 ? (
        <View style={s.emptyContainer}>
          <Text style={s.emptyText}>No gifts assigned yet</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderPurchase}
          keyExtractor={(item) => item._id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={true}
        />
      )}
      <Footer />
    </View>
  );
}

/* --------------------------------------------------- */
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-around",
  marginBottom: 16,
  paddingHorizontal: 4,
  marginTop:20
},
headerTitle: {
  fontSize: 22,
  fontWeight: "bold",
  textAlign: "center",
},

  list: { paddingHorizontal: 16, paddingBottom: 20 },

  purchaseCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: "hidden",
  },
  purchaseHeader: {
    padding: 16,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  offerDetails: {
    fontSize: 14,
    color: "#eee",
    marginTop: 4,
  },

  giftsTable: { padding: 12 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  th: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 15,
    color: "#333",
    textAlign: "center",
  },

  giftRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 45,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  giftName: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  giftQty: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "right",
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#666", fontSize: 16 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  emptyText: { fontSize: 16, color: "#999", textAlign: "center" },
});