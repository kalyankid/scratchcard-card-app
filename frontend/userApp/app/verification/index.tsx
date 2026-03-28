import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../theme/theme"; // 👈 same as LoginScreen

type StatusResponse = {
  status: "pending" | "approved" | "rejected";
};

export default function VerificationScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");

  // 👇 dynamic theme handling
  const { primary, isDark } = useTheme();
  const bgColor = isDark ? "#000" : "#fff";

  useEffect(() => {
    const checkStatus = async () => {
      const email = await AsyncStorage.getItem("userEmail");
      if (!email) return;

      try {
        const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
        console.log("✅ BASE_URL:", BASE_URL);
        const res = await axios.get<StatusResponse>(
          `${BASE_URL}/api/auth/status?email=${email}`
        );

        setStatus(res.data.status);
        await AsyncStorage.setItem("userStatus", res.data.status);
      } catch (err: any) {
        console.log("Error checking status:", err.response?.data || err.message);
      }
    };

    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const renderMessage = () => {
    switch (status) {
      case "approved":
        return {
          text: "✅ Great news! Your profile has been approved. You can now log in and access the dashboard.",
          style: styles.approved,
        };
      case "pending":
        return {
          text: "⏳ Your request is still pending. Once approved by Admin, you’ll be able to log in.",
          style: styles.pending,
        };
      case "rejected":
        return {
          text: "❌ Unfortunately, your profile was rejected by Admin. Please contact support if you think this is a mistake.",
          style: styles.rejected,
        };
      default:
        return { text: "", style: {} };
    }
  };

  const { text, style } = renderMessage();

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.title, style, { color: primary }]}>{text}</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: primary }]}
        onPress={() => router.replace("/login")}
      >
        <Text
          style={[
            styles.buttonText,
            { color: isDark ? "#000" : "#fff" }, // contrast text on theme
          ]}
        >
          Go to Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 30,
  },
  approved: {
    color: "#27ae60", // green
  },
  pending: {
    color: "#f39c12", // yellow
  },
  rejected: {
    color: "#e74c3c", // red
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
