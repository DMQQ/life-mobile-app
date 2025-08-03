import React, { useRef } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, StyleProp, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, withSpring, interpolate, useSharedValue } from "react-native-reanimated";
import Colors from "@/constants/Colors";
import Color from "color";
import Ripple from "react-native-material-ripple";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface FlipCardProps {
  frontContent: string;
  backContent: string;
  explanation: string;
  container: StyleProp<ViewStyle>;

  groupId: string;

  showExpand?: boolean;
}

const FlipCard: React.FC<FlipCardProps> = ({ frontContent, backContent, explanation, container, groupId, showExpand = true }) => {
  const spin = useSharedValue<number>(0);
  const isFlipped = useRef<boolean>(false);

  const handleFlip = (): void => {
    isFlipped.current = !isFlipped.current;
    spin.value = withSpring(isFlipped.current ? 1 : 0, {
      damping: 12,
      stiffness: 90,
    });
  };

  const frontStyle = useAnimatedStyle(() => {
    const rotateX = interpolate(spin.value, [0, 1], [0, -180]);
    return {
      transform: [{ rotateX: `${rotateX}deg` }],
      backfaceVisibility: "hidden",
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateX = interpolate(spin.value, [0, 1], [180, 0]);
    return {
      transform: [{ rotateX: `${rotateX}deg` }],
      backfaceVisibility: "hidden",
    };
  });

  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity style={[container, { transform: [{ perspective: 1000 }] }]} onPress={handleFlip} activeOpacity={1}>
      <Animated.View style={[styles.card, frontStyle]}>
        <Text style={styles.text}>{frontContent}</Text>
      </Animated.View>
      <Animated.View style={[styles.card, styles.backCard, backStyle]}>
        <Text style={styles.text}>{backContent}</Text>
        <Text style={[styles.text, { fontSize: 16, marginTop: 10 }]}>{explanation}</Text>
      </Animated.View>
      {showExpand && (
        <Ripple
          style={{ position: "absolute", right: 15, bottom: 15, padding: 5 }}
          onPress={() => groupId && navigation.navigate("SwipeFlashCards", { groupId })}
        >
          <Entypo name="resize-full-screen" size={18} color={Colors.foreground} />
        </Ripple>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  card: {
    padding: 10,
    width: "100%",
    height: "100%",
    backgroundColor: Colors.primary_lighter,
    borderRadius: 16,
    position: "absolute",
    backfaceVisibility: "hidden",
    justifyContent: "center",
    alignItems: "center",
    transformOrigin: "center center",
    transform: [{ perspective: 1000 }],
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  frontCard: {
    transform: [{ rotateX: "0deg" }],
  },
  backCard: {
    backgroundColor: Color(Colors.primary_lighter).lighten(0.5).hex(),
    transform: [{ rotateX: "180deg" }],
  },
  text: {
    fontSize: 22.5,
    textAlign: "center",
    color: Colors.foreground,
  },
});

export default FlipCard;
