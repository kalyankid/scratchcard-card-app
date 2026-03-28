// app/dashboard/index.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
import ScratchView from "@/components/ScratchView";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Swiper from "react-native-swiper";
import { LinearGradient } from "expo-linear-gradient";
import { DeviceEventEmitter } from "react-native";
import OnboardingScreen from "@/components/Onboarding";
import { useTheme } from "../../theme/theme"; // ← ADD THIS

type ScratchCard = {
  _id: string;
  scratched: boolean;
  prize: string;
  imageUrl?: string;
  createdAt?: string;
};

export default function DashboardScreen() {
  const router = useRouter();
  const { primary, isDark } = useTheme(); 
  const bgColor = isDark ? "#000" : "#fff"; 

  const [userEmail, setUserEmail] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("User");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [cards, setCards] = useState<ScratchCard[] | null>(null);
  const [selectedCard, setSelectedCard] = useState<ScratchCard | null>(null);
  const [showScratchModal, setShowScratchModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
  const screenWidth = Dimensions.get("window").width;
  const cardWidth = (screenWidth - 48) / 2;

  // ONBOARDING
  useEffect(() => {
    const checkOnboarding = async () => {
      const isNewUser = await AsyncStorage.getItem("isNewUser");
      if (isNewUser === "true") {
        setShowOnboarding(true);
      }
    };
    checkOnboarding();
  }, []);

  // LOAD DATA
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
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

        if (!token) throw new Error("No token");

        const res = await axios.get<ScratchCard[]>(
          `${BASE_URL}/api/dashboard/scratch-cards`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCards(res.data);
        await checkLowCardNotification(res.data);
      } catch (error) {
        console.error("[Dashboard] Error loading data:", error);
        setCards([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const checkLowCardNotification = async (cardList: ScratchCard[]): Promise<void> => {
    const availableCards = cardList.filter((c) => !c.scratched).length;
    const stored = await AsyncStorage.getItem("notification");
    let existing: { message: string; date: string }[] = stored ? JSON.parse(stored) : [];
    let newNotificationAdded = false;

    const alreadyExists = existing.some(
      (n) => n.message === "Card stock running low! Please purchase more cards."
    );

    if (availableCards < 10 && !alreadyExists) {
      const now = new Date().toLocaleString();
      const newNotification = {
        message: "Card stock running low! Please purchase more cards.",
        date: now,
      };
      existing.push(newNotification);
      await AsyncStorage.setItem("notifications", JSON.stringify(existing));
      newNotificationAdded = true;
    }

    if (newNotificationAdded) {
      await AsyncStorage.setItem("hasNotificationFlag", "true");
      DeviceEventEmitter.emit("newNotification", true);
    }
  };

  const profileInitials =
    firstName && lastName
      ? `${firstName[0]?.toUpperCase() || "U"}${lastName[0]?.toUpperCase() || ""}`
      : "U";

  const handleCardPress = (card: ScratchCard) => {
    if (card.scratched) return;
    setSelectedCard(card);
    setShowScratchModal(true);
  };

  const handleScratchComplete = async () => {
    if (!selectedCard || !cards) return;
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
      await checkLowCardNotification(cards);
    } catch (err) {
      console.error("Scratch error:", err);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setShowSidebar(false);
    router.replace("/login");
  };

  const [bannerImages, setBannerImages] = useState<any[]>([
    require("../../assets/images/banner6.jpg"),
    require("../../assets/images/banner2.jpeg"),
    require("../../assets/images/banner4.webp"),
  ]);

  useFocusEffect(
    useCallback(() => {
      const fetchBanners = async () => {
        const token = await AsyncStorage.getItem("authToken");
        try {
          const res = await fetch(`${BASE_URL}/api/dashboard/banner`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok && data.banners.length > 0) {
            setBannerImages(data.banners.map((b: string) => ({ uri: `${b}?t=${Date.now()}` })));
          } else {
            setBannerImages([]);
          }
        } catch (err) {
          console.error("Failed to fetch banners", err);
        }
      };
      fetchBanners();
    }, [])
  );

  const toggleSidebar = () => setShowSidebar((prev) => !prev);

  const renderCard = ({ item }: { item: ScratchCard }) => (
    <View style={[styles.scratchCardContainer, { width: cardWidth }]}>
      <Image
        source={require("../../assets/images/scratch-card-image.png")}
        style={styles.scratchCardImage}
        resizeMode="cover"
      />
      {!item.scratched ? (
        <TouchableOpacity
          style={[styles.scratchButton, { backgroundColor: primary }]}
          onPress={() => handleCardPress(item)}
        >
          <Text style={styles.scratchButtonText}>Scratch Now</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.prizeText}>
          {item.prize.includes("Better Luck") ? "Better Luck Next Time!" : `${item.prize}`}
        </Text>
      )}
    </View>
  );

  if (showOnboarding) {
    return <OnboardingScreen onDone={() => setShowOnboarding(false)} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Navbar firstName={firstName} lastName={lastName} onAvatarPress={toggleSidebar} />

      <View style={styles.carouselContainer}>
        <Swiper
          autoplay
          autoplayTimeout={3}
          showsPagination
          dotColor="#ccc"
          activeDotColor={primary}
          height={180}
        >
          {bannerImages.map((img, index) => (
            <View key={index} style={styles.slide}>
              <Image
                source={typeof img === "string" ? { uri: img } : img}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            </View>
          ))}
        </Swiper>
      </View>

      <View style={styles.cardsHeaderContainer}>
        <Text style={[styles.cardsHeaderText, { color: primary }]}>Available Cards</Text>
      </View>

      <FlatList
        data={cards?.filter((card) => !card.scratched)}
        renderItem={renderCard}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color: "#fff" }}>
            No available cards!
          </Text>
        }
      />

      <Modal visible={showScratchModal} animationType="slide">
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
                  {selectedCard.prize.toLowerCase().includes("better luck")
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
  container: { flex: 1, backgroundColor: "#fff" },
  carouselContainer: {
    height: 180,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  slide: { flex: 1, justifyContent: "center", alignItems: "center" },
  bannerImage: { width: "100%", height: "100%", borderRadius: 12 },
  scratchCardContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginBottom: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#888",
  },
  scratchCardImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginBottom: 12,
  },
  scratchButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  scratchButtonText: {
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
  },
  prizeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  cardsHeaderContainer: {
    paddingHorizontal: 16,
    marginBottom: 6,
    marginTop: 8,
  },
  cardsHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "left",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
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
});