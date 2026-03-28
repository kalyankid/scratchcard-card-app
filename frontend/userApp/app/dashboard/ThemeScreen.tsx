// app/dashboard/ThemeScreen.tsx
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useTheme } from "../../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import Footer from "@/components/Footer";
import { useRouter } from "expo-router";


export default function ThemeScreen() {
  const { themes, primary, setPrimary, isDark, toggleDarkMode } = useTheme();
  const router = useRouter();


  const applyTheme = (color: string) => {
    setPrimary(color);
    Alert.alert("Theme Applied", "Your app theme has been updated!", [{ text: "OK" }]);
  };

  const selectedBorderColor = isDark ? "#fff" : "#000"; // ← DYNAMIC BORDER

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
  <Ionicons
    name="arrow-back"
    size={28}
    color={primary}
    onPress={() => router.back()}
  />
  <Text style={[styles.headerTitle, { color: primary }]}>Choose Theme Color</Text>
  <View style={{ width: 28 }} /> 
</View>


        <View style={styles.grid}>
          {themes.map((color, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.colorCircle,
                { backgroundColor: color },
                primary === color && [styles.selected, { borderColor: selectedBorderColor }],
              ]}
              onPress={() => applyTheme(color)}
            >
              {primary === color && <Ionicons name="checkmark" size={28} color={isDark ? "#fff" : "#000"} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* LIGHT / DARK MODE TOGGLE */}
        <View style={styles.modeSection}>
          <Text style={[styles.modeTitle, { color: primary }]}>Background Mode</Text>
          <View style={styles.modeGrid}>
            <TouchableOpacity
              style={[
                styles.modeBox,
                isDark && styles.modeSelected,
                { backgroundColor: "#000" },
              ]}
              onPress={() => !isDark && toggleDarkMode()}
            >
              <Ionicons name="moon" size={32} color="#fff" />
              <Text style={styles.modeLabel}>Dark</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeBox,
                !isDark && styles.modeSelected,
                { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd" },
              ]}
              onPress={() => isDark && toggleDarkMode()}
            >
              <Ionicons name="sunny" size={32} color="#000" />
              <Text style={[styles.modeLabel, { color: "#000" }]}>Light</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
 header: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 20,
  marginTop:10
},
headerTitle: {
  fontSize: 22,
  fontWeight: "bold",
  textAlign: "center",
},

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  colorCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    margin: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  selected: {
    borderWidth: 4,
  },
  modeSection: {
    marginTop: 20,
    alignItems: "center",
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  modeGrid: {
    flexDirection: "row",
    gap: 20,
  },
  modeBox: {
    width: 100,
    height: 100,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  modeSelected: {
    borderWidth: 3,
    borderColor: "#fff",
  },
  modeLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});