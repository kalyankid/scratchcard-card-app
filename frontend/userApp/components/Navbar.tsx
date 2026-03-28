// components/Navbar.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { DeviceEventEmitter } from "react-native";
import { useTheme } from "../theme/theme"; // ← ADD THIS

type NavbarProps = {
  firstName: string;
  lastName: string;
  onAvatarPress: () => void;
};

export default function Navbar({ firstName, lastName, onAvatarPress }: NavbarProps) {
  const { primary } = useTheme(); // ← GET DYNAMIC PRIMARY COLOR
  const profileInitials =
    firstName && lastName
      ? `${firstName[0]?.toUpperCase() || "U"}${lastName[0]?.toUpperCase() || ""}`
      : "U";
  const router = useRouter();
  const [hasNotification, setHasNotification] = useState(false);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "newNotification",
      (value: boolean) => {
        setHasNotification(value);
      }
    );

    const init = async () => {
      const stored = await AsyncStorage.getItem("hasNotificationFlag");
      setHasNotification(stored === "true");
    };
    init();

    return () => subscription.remove();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const checkNotifications = async () => {
        const stored = await AsyncStorage.getItem("hasNotificationFlag");
        setHasNotification(stored === "true");
      };
      checkNotifications();
    }, [])
  );

  return (
    <View style={[styles.navbar, { borderBottomColor: primary }]}>
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={onAvatarPress}>
          <View style={[styles.avatar, { backgroundColor: primary }]}>
            <Text style={styles.avatarText}>{profileInitials}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push("/dashboard/Notifications")}>
        <View>
          <Ionicons style={styles.notificationIcon} name="notifications" size={26} color={primary} />
          {hasNotification && <View style={styles.dot} />}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 3,
    borderBottomWidth: 1,
  },
  profileSection: { flexDirection: "row", alignItems: "center" },
  avatar: {
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 10,
  },
  avatarText: { color: "#000", fontSize: 16, fontWeight: "bold" },
  notificationIcon: { marginTop: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "red", position: "absolute", right: -2, top: 6 },
});