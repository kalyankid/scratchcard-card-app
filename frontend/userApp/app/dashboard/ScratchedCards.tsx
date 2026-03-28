// app/dashboard/ScratchedCards.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Modal,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTheme } from "../../theme/theme"; // ← ADD THIS

type ScratchCard = { _id: string; scratched: boolean; prize: string; createdAt?: string };

export default function ScratchedCards() {
  const router = useRouter();
   const { primary, isDark } = useTheme(); 
    const bgColor = isDark ? "#000" : "#fff";

  const [cards, setCards] = useState<ScratchCard[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("User");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [totalCards, setTotalCards] = useState(0);
  const [scratchedCount, setScratchedCount] = useState(0);
  const [unscratchedCount, setUnscratchedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
  const screenWidth = Dimensions.get("window").width;
  const cardWidth = (screenWidth - 48) / 2;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [email, role, token, fn, ln] = await Promise.all([
        AsyncStorage.getItem("userEmail"),
        AsyncStorage.getItem("userRole"),
        AsyncStorage.getItem("authToken"),
        AsyncStorage.getItem("firstName"),
        AsyncStorage.getItem("lastName"),
      ]);

      if (email) setUserEmail(email);
      if (role) setUserRole(role);
      if (fn) setFirstName(fn);
      if (ln) setLastName(ln);

      try {
        // 1. Fetch all cards for total counts
        const allRes = await axios.get<ScratchCard[]>(
          `${BASE_URL}/api/dashboard/scratch-cards`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const allCards = allRes.data;
        setTotalCards(allCards.length);

        const scratched = allCards.filter((c) => c.scratched).length;
        setScratchedCount(scratched);
        setUnscratchedCount(allCards.length - scratched);

        // 2. Fetch only scratched cards
        const scratchedRes = await axios.get<ScratchCard[]>(
          `${BASE_URL}/api/dashboard/scratch-cards?scratched=true`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCards(scratchedRes.data);
      } catch (err) {
        console.error("Scratched cards error:", err);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setShowSidebar(false);
  };

  const toggleSidebar = () => setShowSidebar((prev) => !prev);

  const profileInitials =
    firstName && lastName
      ? `${firstName[0]?.toUpperCase() || "U"}${lastName[0]?.toUpperCase() || ""}`
      : "U";

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Navbar */}
      <Navbar firstName={firstName} lastName={lastName} onAvatarPress={toggleSidebar} />

      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: primary }]}>
          <Text style={styles.summaryNumber}>{totalCards}</Text>
          <Text style={styles.summaryLabel}>Total Cards</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: primary }]}>
          <Text style={styles.summaryNumber}>{scratchedCount}</Text>
          <Text style={styles.summaryLabel}>Scratched</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: primary }]}>
          <Text style={styles.summaryNumber}>{unscratchedCount}</Text>
          <Text style={styles.summaryLabel}>Unscratched</Text>
        </View>
      </View>

      {/* Cards Section */}
      {loading ? (
        <ActivityIndicator size="large" color={primary} style={{ marginTop: 50 }} />
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={cards}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: 12,
              padding: 16,
            }}
            renderItem={({ item }) => (
              <ImageBackground
                source={require("../../assets/images/scartch-card-win-bg.png")}
                style={[styles.cardImage, { width: cardWidth }]}
                imageStyle={styles.cardImageStyle}
              >
                <View style={styles.overlay}>
                  <Text style={[styles.prizeText, { color: primary }]}>{item.prize}</Text>
                </View>
              </ImageBackground>
            )}
            ListEmptyComponent={
              <View style={{ alignItems: "center", marginTop: 50 }}>
                <Text style={{ color: primary, fontSize: 16 }}>No Scratched Cards Yet</Text>
              </View>
            }
          />

          {/* Back to Home Button */}
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: primary }]}
            onPress={() => router.push("/dashboard")}
          >
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sidebar Modal */}
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

      {/* Footer */}
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  summaryCard: {
    width: (Dimensions.get("window").width - 48) / 3,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryNumber: { fontSize: 18, fontWeight: "bold", color: "#000" },
  summaryLabel: { fontSize: 12, color: "#000", marginTop: 4, textAlign: "center" },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginVertical: 20,
  },
  backButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  cardImage: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
  },
  cardImageStyle: {
    borderRadius: 12,
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  prizeText: {
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});