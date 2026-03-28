// app/dashboard/UnscratchedCards.tsx
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
import ScratchView from "@/components/ScratchView";
import { useTheme } from "../../theme/theme"; // ← ADD THIS

type ScratchCard = {
  _id: string;
  scratched: boolean;
  prize: string;
  imageUrl?: string;
  createdAt?: string;
};

export default function UnscratchedCards() {
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
  const [selectedCard, setSelectedCard] = useState<ScratchCard | null>(null);
  const [showScratchModal, setShowScratchModal] = useState(false);

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
        // 1. Fetch all cards for counts
        const allRes = await axios.get<ScratchCard[]>(
          `${BASE_URL}/api/dashboard/scratch-cards`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const allCards = allRes.data;
        setTotalCards(allCards.length);

        const scratched = allCards.filter((c) => c.scratched).length;
        setScratchedCount(scratched);
        setUnscratchedCount(allCards.length - scratched);

        // 2. Fetch only unscratched
        const res = await axios.get<ScratchCard[]>(
          `${BASE_URL}/api/dashboard/scratch-cards?scratched=false`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCards(res.data);
      } catch (err) {
        console.error("Unscratched cards error:", err);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCardPress = (card: ScratchCard) => {
    if (card.scratched) return;
    setSelectedCard(card);
    setShowScratchModal(true);
  };

  const handleScratchComplete = async () => {
    if (!selectedCard) return;
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await axios.patch<{ prize: string; imageUrl?: string }>(
        `${BASE_URL}/api/dashboard/scratch-cards/${selectedCard._id}/scratch`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedCard: ScratchCard = {
        ...selectedCard,
        scratched: true,
        prize: res.data.prize,
        imageUrl: res.data.imageUrl,
      };

      setCards(cards.map((c) => (c._id === selectedCard._id ? updatedCard : c)));
      setSelectedCard(updatedCard);
    } catch (err) {
      console.error("Scratch error:", err);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setShowSidebar(false);
    router.replace("/login");
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
              paddingHorizontal: 16,
            }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleCardPress(item)}
                style={{ width: cardWidth }}
              >
                <ImageBackground
                  source={require("../../assets/images/scratch-card-overlay-image-yellow.jpeg")}
                  style={[styles.cardImage, { backgroundColor: primary }]} // fallback
                  imageStyle={styles.cardImageStyle}
                >
                  <View style={styles.overlay}>
                    <Text style={styles.tapText}>Tap to Scratch</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={{ alignItems: "center", marginTop: 50 }}>
                <Text style={{ color: primary, fontSize: 16 }}>No Unscratched Cards</Text>
              </View>
            }
          />

          {/* Buy More Cards Button */}
          <TouchableOpacity
            style={[styles.buyButton, { backgroundColor: primary }]}
            onPress={() => router.push("/dashboard/offers")}
          >
            <Text style={styles.buyButtonText}>Buy More Cards</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Scratch Modal */}
      <Modal visible={showScratchModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Text style={styles.modalTitle}>Scratch & Win!</Text>
          {selectedCard && (
            <>
              <ScratchView
                width={250}
                height={250}
                prize={selectedCard.prize || "No Prize"}
                imageUrl={selectedCard.imageUrl}
                onScratchComplete={handleScratchComplete}
              />

              {selectedCard.scratched && selectedCard.prize && (
                <Text style={styles.revealTextBelow}>
                  {selectedCard.prize.includes("Better Luck")
                    ? "Better Luck Next Time!"
                    : `Congratulations! You won ${selectedCard.prize}`}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.revealButton, { backgroundColor: primary }]}
                onPress={() => setShowScratchModal(false)}
              >
                <Text style={styles.revealText}>Back</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>

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
  buyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginVertical: 20,
  },
  buyButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "#fff" },
  revealButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  revealText: { color: "#000", fontWeight: "bold", textAlign: "center" },
  revealTextBelow: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    fontSize: 15,
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
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  tapText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});