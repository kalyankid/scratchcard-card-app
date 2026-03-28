// components/Footer.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useTheme } from "../theme/theme"; // ← ADD THIS

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname(); // Get current route
  const { primary } = useTheme(); // ← GET DYNAMIC PRIMARY COLOR

  // Utility function to check if tab is active
  const isActive = (path: string) => pathname === path;

  return (
    <View style={[styles.footer, { borderTopColor: primary }]}>
      {/* Home */}
      <TouchableOpacity
        style={styles.footerItem}
        onPress={() => router.replace("/dashboard")}
      >
        <Ionicons
          name={isActive("/dashboard") ? "home" : "home-outline"}
          size={26}
          color={isActive("/dashboard") ? primary : "#666"}
        />
        <Text
          style={[
            styles.footerText,
            { color: isActive("/dashboard") ? primary : "#666" },
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      {/* Scratched */}
      <TouchableOpacity
        style={styles.footerItem}
        onPress={() => router.push("/dashboard/ScratchedCards")}
      >
        <Ionicons
          name={
            isActive("/dashboard/ScratchedCards")
              ? "checkmark-done-circle"
              : "checkmark-done-circle-outline"
          }
          size={26}
          color={isActive("/dashboard/ScratchedCards") ? primary : "#666"}
        />
        <Text
          style={[
            styles.footerText,
            {
              color: isActive("/dashboard/ScratchedCards") ? primary : "#666",
            },
          ]}
        >
          Scratched
        </Text>
      </TouchableOpacity>

      {/* Unscratched */}
      <TouchableOpacity
        style={styles.footerItem}
        onPress={() => router.push("/dashboard/UnscratchedCards")}
      >
        <Ionicons
          name={
            isActive("/dashboard/UnscratchedCards")
              ? "help-circle"
              : "help-circle-outline"
          }
          size={26}
          color={isActive("/dashboard/UnscratchedCards") ? primary : "#666"}
        />
        <Text
          style={[
            styles.footerText,
            {
              color: isActive("/dashboard/UnscratchedCards") ? primary : "#666",
            },
          ]}
        >
          Unscratched
        </Text>
      </TouchableOpacity>

      {/* Offers */}
      <TouchableOpacity
        style={styles.footerItem}
        onPress={() => router.push("/dashboard/offers")}
      >
        <Ionicons
          name={isActive("/dashboard/offers") ? "cart" : "cart-outline"}
          size={26}
          color={isActive("/dashboard/offers") ? primary : "#666"}
        />
        <Text
          style={[
            styles.footerText,
            { color: isActive("/dashboard/offers") ? primary : "#666" },
          ]}
        >
          Offers
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    backgroundColor: "#fff",
  },
  footerItem: { alignItems: "center" },
  footerText: { fontSize: 12, marginTop: 4 },
});