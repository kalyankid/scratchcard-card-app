// components/Sidebar.tsx
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../theme/theme"; // ← ADD THIS

type SidebarProps = {
  firstName: string;
  lastName: string;
  role: string;
  onLogout: () => void;
  onClose: () => void;
};

const { width } = Dimensions.get("window");
const SIDEBAR_W = width * 0.75;

export default function Sidebar({
  firstName,
  lastName,
  role,
  onLogout,
  onClose,
}: SidebarProps) {
  const router = useRouter();
   const { primary, isDark  } = useTheme(); // ← GET DYNAMIC PRIMARY COLOR
  const bgColor = isDark ? "#000" : "#fff"; // or use your theme helper

  return (
    <View style={styles.overlay}>
      <View style={styles.sidebar}>
        {/* Header */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={28} color={primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.name, { color: primary }]}>{firstName} {lastName}</Text>
          <Text style={[styles.role, { color: primary }]}>{role}</Text>
        </View>

        {/* Clickable Headings */}
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              router.push("/dashboard/Purchases");
            }}
          >
            <Ionicons name="cart-outline" size={24} color={primary} style={styles.icon} />
            <Text style={[styles.menuText, { color: primary }]}>Purchases</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              router.push("/dashboard/CurrentGifts");
            }}
          >
            <Ionicons name="pricetag-outline" size={24} color={primary} style={styles.icon} />
            <Text style={[styles.menuText, { color: primary }]}>Assigned Gifts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              router.push("/dashboard/Settings");
            }}
          >
            <Ionicons name="settings-outline" size={24} color={primary} style={styles.icon} />
            <Text style={[styles.menuText, { color: primary }]}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              router.push("/dashboard/ThemeScreen");
            }}
          >
            <Ionicons name="color-palette-outline" size={24} color={primary} style={styles.icon} />
            <Text style={[styles.menuText, { color: primary }]}>Theme</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: primary }]} onPress={onLogout}>
          <Text style={styles.logoutTxt}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* --------------------------------------------------- */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
  },
  sidebar: {
    width: SIDEBAR_W,
    height: "100%",
    backgroundColor: "#000",
    paddingTop: 30,
    paddingHorizontal: 16,
  },
  closeBtn: { alignSelf: "flex-end", marginBottom: 10 },
  header: { alignItems: "center", marginBottom: 20 },
  name: { fontSize: 20, fontWeight: "bold" },
  role: { fontSize: 15, marginTop: 4 },

  menu: { flex: 1, alignItems: "flex-start" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#333",
  },
  icon: { marginRight: 12 },
  menuText: { fontSize: 16, fontWeight: "bold" },

  logoutBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  logoutTxt: { color: "#000", fontWeight: "bold" },
});