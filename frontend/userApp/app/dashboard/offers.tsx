// app/dashboard/Offers.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTheme } from "../../theme/theme"; // ← ADD THIS

type Offer = {
  _id: string;
  title: string;
  price: number;
  cards: number;
};

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export default function OffersScreen() {
  const router = useRouter();
  const { primary, isDark  } = useTheme(); // ← GET DYNAMIC PRIMARY COLOR
  const bgColor = isDark ? "#000" : "#fff"; // or use your theme helper


  const [offers, setOffers] = useState<Offer[]>([]);
  const [role, setRole] = useState<string>("retailer");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("User");
  const [showSidebar, setShowSidebar] = useState(false);

  const screenWidth = Dimensions.get("window").width;
  const cardWidth = (screenWidth - 48) / 2;

  useEffect(() => {
    const loadData = async () => {
      const [storedRole, email, fn, ln] = await Promise.all([
        AsyncStorage.getItem("userRole"),
        AsyncStorage.getItem("userEmail"),
        AsyncStorage.getItem("firstName"),
        AsyncStorage.getItem("lastName"),
      ]);

      if (storedRole) {
        setRole(storedRole);
        setUserRole(storedRole);
      }
      if (email) setUserEmail(email);
      if (fn) setFirstName(fn);
      if (ln) setLastName(ln);

      try {
        const res = await fetch(`${BASE_URL}/api/offers/role/${storedRole}`);
        const data = await res.json();
        setOffers(data);
      } catch (err) {
        console.error("Offers fetch error:", err);
      }
    };
    loadData();
  }, []);

  const handlePurchase = async (offer: Offer) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Please log in again.");
        return;
      }

      await axios.post(
        `${BASE_URL}/api/purchase`,
        { offerId: offer._id },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      Alert.alert(
        "Purchase Successful",
        `You purchased ${offer.cards} cards. Moving to purchases screen to upload the proof of purchase`,
        [{ text: "OK", onPress: () => router.replace("/dashboard/Purchases") }]
      );
    } catch (err: any) {
      const message = err.response?.data?.message || "Purchase failed.";
      Alert.alert("Error", message);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setShowSidebar(false);
    router.replace("/login");
  };

  const toggleSidebar = () => setShowSidebar((prev) => !prev);

  const AnimatedCard = ({ item }: { item: Offer }) => {
    const scale = new Animated.Value(1);

    const onPressIn = () => {
      Animated.timing(scale, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    };

    return (
      <TouchableWithoutFeedback
        onPress={() => handlePurchase(item)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View style={[styles.card, { width: cardWidth, transform: [{ scale }] }]}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: primary }]}>{item.title}</Text>
            <Text style={styles.cardPrice}>₹{item.price}</Text>
            <Text style={styles.cardCards}>{item.cards} Cards</Text>
          </View>
          <View style={[styles.cardFooter, { backgroundColor: primary }]}>
            <Text style={styles.purchaseText}>Tap to Purchase</Text>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Navbar firstName={firstName} lastName={lastName} onAvatarPress={toggleSidebar} />

      <FlatList
        data={offers}
        renderItem={AnimatedCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
            <Text style={{ color: primary, fontSize: 16 }}>No offers available</Text>
          </View>
        }
      />

      <Modal visible={showSidebar} transparent animationType="fade" onRequestClose={toggleSidebar}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={toggleSidebar}>
          <Sidebar
            firstName={firstName}
            lastName={lastName}
            role={userRole}
            onLogout={handleLogout}
            onClose={toggleSidebar}
          />
        </TouchableOpacity>
      </Modal>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 5,
    borderLeftWidth: 6,
    overflow: "hidden",
  },
  cardContent: { alignItems: "center", marginBottom: 12 },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  cardPrice: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4 },
  cardCards: { fontSize: 14, color: "#666" },
  cardFooter: {
    paddingVertical: 8,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  purchaseText: { color: "#000", fontWeight: "bold", fontSize: 14 },
});