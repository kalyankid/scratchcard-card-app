// src/screens/LoginScreen.tsx
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../components/Button";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/theme"; // ← ADD THIS

type LoginResponse = {
  token: string;
  userId: string;
  role?: string;
  firstName: string;
  lastName: string;
};

export default function LoginScreen() {
  const router = useRouter();
   const { primary, isDark } = useTheme(); 
    const bgColor = isDark ? "#000" : "#fff";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"approved" | "pending" | "rejected" | "">("");

  const validateInputs = () => {
    if (!email.trim() || !password.trim()) {
      alert("Please fill in all fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    try {
      const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
      const res = await axios.post<LoginResponse>(`${BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      if (res.data.token) {
        setStatusMessage("Login successful! Redirecting you to the dashboard...");
        setStatusType("approved");

        await AsyncStorage.setItem("userStatus", "dashboard");
        await AsyncStorage.setItem("userEmail", email);
        await AsyncStorage.setItem("userId", res.data.userId);
        await AsyncStorage.setItem("userRole", res.data.role || "User");
        await AsyncStorage.setItem("authToken", res.data.token);
        await AsyncStorage.setItem("firstName", res.data.firstName);
        await AsyncStorage.setItem("lastName", res.data.lastName);

        setTimeout(() => {
          router.replace("/dashboard");
        }, 1500);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Unknown error";

      if (message.toLowerCase().includes("pending")) {
        setStatusMessage("Your profile is still pending approval. Once approved, you can log in.");
        setStatusType("pending");
      } else if (message.toLowerCase().includes("rejected")) {
        setStatusMessage("Your profile has been rejected by Admin. Please contact support.");
        setStatusType("rejected");
      } else {
        setStatusMessage("Login failed. Please check your credentials and try again.");
        setStatusType("");
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.title, { color: primary }]}>Login</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor={primary} // ← NOW DYNAMIC
        value={email}
        onChangeText={setEmail}
        style={[styles.input, { color: primary }]}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          placeholderTextColor={primary} // ← NOW DYNAMIC
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={[styles.passwordInput, { color: primary }]}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={24}
            color={primary} // ← NOW DYNAMIC
          />
        </TouchableOpacity>
      </View>

      <Button title="Login" onPress={handleLogin} />

      <Text style={styles.signupText}>
        Don't have an account?{" "}
        <Text
          style={[styles.signupLink, { color: primary }]}
          onPress={() => router.push("/signup")}
        >
          Sign up
        </Text>
      </Text>

      {statusMessage ? (
        <Text
          style={[
            styles.statusText,
            statusType === "approved"
              ? styles.approved
              : statusType === "pending"
              ? styles.pending
              : statusType === "rejected"
              ? styles.rejected
              : styles.error,
          ]}
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {statusMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  statusText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  approved: { color: "#27ae60" },
  pending: { color: "#f39c12" },
  rejected: { color: "#e74c3c" },
  error: { color: "#e74c3c" },
  signupText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#ccc",
  },
  signupLink: {
    fontWeight: "bold",
    fontSize: 18,
  },
});