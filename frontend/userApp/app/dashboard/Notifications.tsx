// app/dashboard/Notifications.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Easing,
  DeviceEventEmitter,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/theme";
import Footer from "@/components/Footer";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<{ message: string; date: string }[]>([]);
  const router = useRouter();
  const scale = new Animated.Value(0.9);

  const { primary, isDark } = useTheme();
  const bgColor = isDark ? "#000" : "#fff";
  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "#ddd";
  const textColor = isDark ? "#fff" : "#000";
  const subTextColor = isDark ? "#aaa" : "#666";

  useEffect(() => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const load = async () => {
      const n = await AsyncStorage.getItem("notifications");
      setNotifications(n ? JSON.parse(n) : []);
      await AsyncStorage.setItem("hasNotificationFlag", "false");
      DeviceEventEmitter.emit("newNotification", false);
    };
    load();
  }, []);

  const handlePurchaseNow = () => {
    router.push("/dashboard/offers");
  };

  const renderNotification = ({ item }: { item: { message: string; date: string } }) => (
    <Animated.View style={[styles.card, { transform: [{ scale }], backgroundColor: cardBg, borderColor: cardBorder }]}>
      <View style={styles.textContainer}>
        <Text style={[styles.message, { color: textColor }]}>{item.message}</Text>
        <Text style={[styles.date, { color: subTextColor }]}>{item.date}</Text>
      </View>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: primary }]}
        onPress={handlePurchaseNow}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, { color: "#fff" }]}>Purchase Now</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header with back arrow */}
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={28}
          color={primary}
          onPress={() => router.back()}
        />
        <Text style={[styles.headerTitle, { color: primary }]}>Notifications</Text>
        <View style={{ width: 28 }} /> 
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderNotification}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyContainer : { paddingBottom: 20 }
        }
        ListEmptyComponent={<Text style={[styles.empty, { color: subTextColor }]}>No notifications</Text>}
        style={{ flex: 1, paddingHorizontal: 16 }}
      />

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 6,
  },
  textContainer: {
    marginBottom: 14,
  },
  message: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 6,
    lineHeight: 22,
  },
  date: {
    fontSize: 13,
    fontStyle: "italic",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  empty: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 17,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
