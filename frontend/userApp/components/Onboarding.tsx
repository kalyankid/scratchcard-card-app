import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../theme/theme";
import Onboarding from "react-native-onboarding-swiper";

const OnboardingScreen = ({ onDone }: { onDone: () => void }) => {
  return (
    <Onboarding
      onDone={async () => {
        await AsyncStorage.removeItem("isNewUser");
        onDone();
      }}
      onSkip={async () => {
        await AsyncStorage.removeItem("isNewUser");
        onDone();
      }}
      pages={[
        // 1️⃣ Dashboard
        {
          backgroundColor: colors.background,
          image: (
            <Image
              source={require("../assets/images/onboarding-dashboard.jpeg")}
              style={styles.image}
              resizeMode="contain"
            />
          ),
          title: "Your Dashboard at a Glance",
          subtitle:
            "Discover all active banners, view your available scratch cards, and navigate easily between Scratched, Unscratched, and Offers tabs. Stay updated with the latest alerts through the notification panel on top.",
        },

        // 2️⃣ Purchases
        {
          backgroundColor: colors.background,
          image: (
            <Image
              source={require("../assets/images/onboarding-purchases.jpeg")}
              style={styles.image}
              resizeMode="contain"
            />
          ),
          title: "Track All Your Purchases",
          subtitle:
            "Easily view every purchase you’ve made right from your profile. Go to Dashboard → Profile → Purchases to see all your bought cards and transaction details in one place.",
        },

        // 3️⃣ Assigned Gifts
        {
          backgroundColor: colors.background,
          image: (
            <Image
              source={require("../assets/images/onboarding-assigned-gifts.jpeg")}
              style={styles.image}
              resizeMode="contain"
            />
          ),
          title: "View All Your Assigned Gifts",
          subtitle:
            "Get a complete list of the gifts assigned to you under Dashboard → Profile → Assigned Gifts. Stay excited and keep track of the rewards you’ve earned!",
        },

        // 4️⃣ Assign Gifts
        {
          backgroundColor: colors.background,
          image: (
            <Image
              source={require("../assets/images/onboarding-assign-gifts.jpeg")}
              style={styles.image}
              resizeMode="contain"
            />
          ),
          title: "Assign Gifts with Ease",
          subtitle:
            "Assign gifts to specific purchases and upload corresponding images effortlessly. Navigate to Dashboard → Profile → Purchases → Assign Gifts to personalize your rewards beautifully.",
        },

        // 5️⃣ Settings
        {
          backgroundColor: colors.background,
          image: (
            <Image
              source={require("../assets/images/onboarding-settings.jpeg")}
              style={styles.image}
              resizeMode="contain"
            />
          ),
          title: "Customize and Manage Settings",
          subtitle:
            "In Dashboard → Profile → Settings, you can update your password, upload or modify banners, and manage the visuals displayed on your dashboard’s top section.",
        },
      ]}
      titleStyles={{
        color: colors.primary,
        fontWeight: "bold",
        fontSize: 24,
        textAlign: "center",
      }}
      subTitleStyles={{
        color: colors.text,
        fontSize: 16,
        lineHeight: 22,
        textAlign: "center",
        marginHorizontal: 10,
      }}
      nextLabel="Next"
      skipLabel="Skip"
      doneLabel="Get Started"
      bottomBarHighlight={false}
      containerStyles={{ paddingHorizontal: 20 }}
      dotStyle={{ backgroundColor: "#ccc" }}
      activeDotStyle={{ backgroundColor: colors.primary }}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: 220,
    height: 220,
    marginBottom: 20,
    borderRadius: 16,
  },
});

export default OnboardingScreen;
