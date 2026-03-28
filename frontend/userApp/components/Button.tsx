// components/Button.tsx
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import React from "react";
import { useTheme } from "@/theme/theme"; // ← ADD THIS

type ButtonProps = {
  title: string;
  onPress: () => void;
};

export const Button: React.FC<ButtonProps> = ({ title, onPress }) => {
  const { primary } = useTheme(); // ← DYNAMIC PRIMARY

  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: primary }]} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  text: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});