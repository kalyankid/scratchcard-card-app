import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";

export default function Index() {
  const [status, setStatus] = useState<
    "loading" | "signup" | "verification" | "login" | "dashboard"
  >("loading");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const storedStatus = await AsyncStorage.getItem("userStatus");

        if (!storedStatus) {
          // first time app opens → show signup
          setStatus("signup");
        } else {
          // previously saved status (after signup / verification / login)
          setStatus(storedStatus as typeof status);
        }
      } catch (err) {
        setStatus("signup");
      }
    };

    checkStatus();
  }, []);

  if (status === "loading") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect according to status
  return (
    <>
      {status === "signup" && <Redirect href="/signup" />}
      {status === "verification" && <Redirect href="/verification" />}
      {status === "login" && <Redirect href="/login" />}
      {status === "dashboard" && <Redirect href="/dashboard" />}
    </>
  );
}
