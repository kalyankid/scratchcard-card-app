import { colors } from "@/theme/theme";
import React, { useState, useRef, useEffect } from "react";
import { View, PanResponder, StyleSheet, Text, ImageBackground } from "react-native";
import Svg, { Rect, Mask, Image as SvgImage, Path } from "react-native-svg";

interface ScratchCardProps {
  width: number;
  height: number;
  prize: string;
  imageUrl?: string;
  onScratchComplete: () => void;
}

const ScratchView: React.FC<ScratchCardProps> = ({
  width,
  height,
  prize,
  imageUrl,
  onScratchComplete,
}) => {
  const [pathData, setPathData] = useState<string>("");
  const [revealed, setRevealed] = useState(false);
  const [totalLength, setTotalLength] = useState(0);

  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
  const scratchRadius = 25; // smoother feel
  const totalArea = width * height;
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const getImageUrl = (path?: string) => {
    if (!path) return undefined;
    return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        lastPoint.current = { x: locationX, y: locationY };
        setPathData((prev) => `${prev} M${locationX},${locationY}`);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const lp = lastPoint.current;
        if (lp) {
          const dx = locationX - lp.x;
          const dy = locationY - lp.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 2) {
            setPathData((prev) => `${prev} L${locationX},${locationY}`);
            setTotalLength((prev) => prev + distance); // track stroke length
            lastPoint.current = { x: locationX, y: locationY };
          }
        }
      },
      onPanResponderRelease: () => {
        lastPoint.current = null;
      },
    })
  ).current;

  // 🧮 Approximate revealed % based on stroke length and scratch width
  useEffect(() => {
    const revealedArea = totalLength * scratchRadius * 2;
    const percentRevealed = (revealedArea / totalArea) * 100;

    if (!revealed && percentRevealed > 45) {
      setRevealed(true);
      setTimeout(() => {
        onScratchComplete();
      }, 500);
    }
  }, [totalLength]);

  return (
    <View style={[styles.cardContainer, { width, height }]}>
      {/* 🏆 Revealed state */}
      {revealed ? (
        <>
          {imageUrl ? (
            <ImageBackground
              source={{ uri: getImageUrl(imageUrl) }}
              style={styles.imageBackground}
              imageStyle={{ borderRadius: 16 }}
              resizeMode="cover"
            />
          ) : (
            <ImageBackground
              source={require("../assets/images/scratch-card-win-gif.gif")}
              style={styles.imageBackground}
              imageStyle={{ borderRadius: 16 }}
              resizeMode="cover"
            >
              <View style={styles.prizeContainer}>
                <Text style={styles.prizeText}>{prize}</Text>
              </View>
            </ImageBackground>
          )}
        </>
      ) : (
        <>
          {/* 🎁 Hidden prize below scratch surface */}
          <View style={styles.hiddenPrizeContainer}>
            <Text style={[styles.prizeText, { color: "transparent" }]}>{prize}</Text>
          </View>

          {/* 🪄 Scratchable silver layer */}
          <Svg width={width} height={height} style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
            <Mask id="mask">
              <Rect x="0" y="0" width={width} height={height} fill="white" />
              <Path
                d={pathData}
                stroke="black"
                strokeWidth={scratchRadius * 2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Mask>

            <SvgImage
              href={require("../assets/images/scratch-card-overlay-image-yellow.jpeg")}
              width={width}
              height={height}
              preserveAspectRatio="xMidYMid slice"
              mask="url(#mask)"
            />
          </Svg>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  imageBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  hiddenPrizeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  prizeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    width: "100%",
  },
  prizeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    textShadowColor: "rgba(255,255,255,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    paddingHorizontal: 8,
  },
});

export default ScratchView;
