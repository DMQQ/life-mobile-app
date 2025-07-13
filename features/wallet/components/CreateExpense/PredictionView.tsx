import { View, Text, StyleSheet, Pressable, TouchableOpacity } from "react-native";
import Colors from "@/constants/Colors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
  FadeIn,
  FadeOut,
  withSpring,
} from "react-native-reanimated";
import { useEffect } from "react";
import { ExpensePrediction } from "../../hooks/usePredictCategory";
import { CategoryIcon, CategoryUtils, Icons } from "../Expense/ExpenseIcon";
import Layout from "@/constants/Layout";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Color from "color";

const styles = StyleSheet.create({
  expense_item: {
    height: 60,
    borderRadius: 20,
    padding: 5,
    paddingRight: 10,
    flexDirection: "row",
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 15,
    marginLeft: 10,
    fontWeight: "bold",
    marginBottom: 0,
    textTransform: "capitalize",
  },
  icon_container: {
    padding: 7.5,
    justifyContent: "center",
  },
  date: {
    color: "#fff",
    fontSize: 10,
    marginLeft: 10,
    lineHeight: 15,
  },
  price_container: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  price: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    padding: 5,
    paddingHorizontal: 7.5,
    backgroundColor: Colors.primary_light,
  },
  buttonText: {
    color: Colors.secondary,
    fontSize: 20,
    fontWeight: "bold",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    height: 40,
    width: 40,
  },
  expanded: {
    padding: 15,
    borderRadius: 15,
    paddingTop: 20,
  },
  glowContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  aiLabel: {
    position: "absolute",
    top: 7.5,
    left: "40%",
    backgroundColor: "rgba(0, 255, 200, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    zIndex: 100,
  },
  aiLabelText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
});

const slideInUpWithScale = () => {
  "worklet";
  const animations = {
    transform: [{ translateY: withSpring(0, { damping: 20, stiffness: 150 }) }, { scale: withSpring(1, { damping: 20, stiffness: 150 }) }],
    opacity: withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
  };
  const initialValues = {
    transform: [{ translateY: 40 }, { scale: 0.9 }],
    opacity: 0,
  };
  return {
    initialValues,
    animations,
  };
};

const slideOutDownWithScale = () => {
  "worklet";
  const animations = {
    transform: [
      { translateY: withTiming(40, { duration: 250, easing: Easing.in(Easing.ease) }) },
      { scale: withTiming(0.9, { duration: 250, easing: Easing.in(Easing.ease) }) },
    ],
    opacity: withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) }),
  };
  const initialValues = {
    transform: [{ translateY: 0 }, { scale: 1 }],
    opacity: 1,
  };
  return {
    initialValues,
    animations,
  };
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PredictionView(item: ExpensePrediction & { applyPrediction: () => void }) {
  const price = item.type === "expense" ? (item.amount * -1).toFixed(2) : item.amount.toFixed(2);
  const isBalanceEdit = item.description.includes("Balance edited") || item.amount === 0;

  const glowAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);
  const shimmerAnimation = useSharedValue(0);

  useEffect(() => {
    glowAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2500, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
        withTiming(0, { duration: 2500, easing: Easing.bezier(0.4, 0, 0.6, 1) })
      ),
      -1,
      true
    );

    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
        withTiming(0.95, { duration: 2000, easing: Easing.bezier(0.4, 0, 0.6, 1) })
      ),
      -1,
      true
    );

    shimmerAnimation.value = withRepeat(withTiming(1, { duration: 4000, easing: Easing.linear }), -1, false);
  }, []);

  const glowStyle = useAnimatedStyle(() => {
    const glowIntensity = interpolate(glowAnimation.value, [0, 1], [0.2, 0.6]);
    const shadowRadius = interpolate(glowAnimation.value, [0, 1], [8, 20]);

    return {
      shadowColor: "#00FFC8",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glowIntensity,
      shadowRadius: shadowRadius,
      elevation: 15,
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnimation.value }],
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerAnimation.value, [0, 1], [-Layout.screen.width, Layout.screen.width]);

    return {
      transform: [{ translateX }],
    };
  });

  const borderGlowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(glowAnimation.value, [0, 1], [0.2, 0.5]);
    return {
      opacity,
    };
  });

  const categoryIcon = Icons[item.category as keyof typeof Icons];
  const iconBackgroundColor = categoryIcon?.backgroundColor || "#00FFC8";

  return (
    <AnimatedPressable
      key={item.description}
      onPress={item.applyPrediction}
      entering={slideInUpWithScale}
      exiting={slideOutDownWithScale}
      style={[pulseStyle, { padding: 15, position: "absolute", top: 0, alignItems: "center", width: Layout.screen.width, zIndex: 1000 }]}
    >
      <Animated.View
        style={[
          styles.aiLabel,
          {
            backgroundColor: Color(iconBackgroundColor).darken(0.1).hex(),
            borderColor: Color(iconBackgroundColor).alpha(0.1).hex(),
          },
        ]}
        entering={FadeIn.delay(200).duration(400).springify()}
        exiting={FadeOut.duration(200)}
      >
        <Text style={styles.aiLabelText}>SMART PREDICTION</Text>
      </Animated.View>

      <Animated.View
        style={[
          {
            marginBottom: 15,
            borderRadius: 20,
            width: (Layout.screen.width - 30) / 1.4,
            overflow: "hidden",
          },
          glowStyle,
        ]}
      >
        <Animated.View
          style={[styles.glowContainer, borderGlowStyle]}
          entering={FadeIn.delay(100).duration(500)}
          exiting={FadeOut.duration(200)}
        >
          <LinearGradient
            colors={[Color(iconBackgroundColor).darken(0.5).hex(), Color(iconBackgroundColor).darken(0.25).hex(), iconBackgroundColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: "absolute",
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              borderRadius: 22,
            }}
          />
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[styles.glowContainer]}
          entering={FadeIn.delay(300).duration(600)}
          exiting={FadeOut.duration(150)}
        >
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.2,
              },
              shimmerStyle,
            ]}
          >
            <LinearGradient
              colors={["transparent", "rgba(255, 255, 255, 0.15)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: 100,
                height: "100%",
              }}
            />
          </Animated.View>
        </Animated.View>

        <TouchableOpacity style={{ zIndex: 1000, flex: 1 }} onPress={item.applyPrediction}>
          <BlurView
            intensity={60}
            style={[
              {
                borderRadius: 20,
                overflow: "hidden",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
              },
              styles.expense_item,
            ]}
          >
            <CategoryIcon type={item.type as "income" | "expense" | "refunded"} category={item.category as any} />

            <View style={{ height: "100%", justifyContent: "center", flex: 3 }}>
              <Text style={[styles.title, { textShadowColor: "rgba(255, 255, 255, 0.3)", textShadowRadius: 2 }]} numberOfLines={1}>
                {item.description}
              </Text>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.date}>
                  {CategoryUtils.getCategoryName(item.category)}
                  {item.confidence ? ` (${Math.round(item.confidence * 100)}%)` : ""}
                </Text>
              </View>
            </View>
            {!isBalanceEdit && (
              <View style={[styles.price_container, { flexDirection: "row" }]}>
                <Text
                  style={[
                    styles.price,
                    {
                      marginRight: 10,
                      width: "100%",
                      textAlign: "right",
                      color: item.type === "refunded" ? Colors.secondary_light_2 : item.type === "expense" ? "#F07070" : "#66E875",
                      textShadowColor: item.type === "expense" ? "rgba(240, 112, 112, 0.5)" : "rgba(102, 232, 117, 0.5)",
                      textShadowRadius: 3,
                      ...(item.type === "refunded" ? { textDecorationLine: "line-through" } : {}),
                    },
                  ]}
                >
                  {price}
                  <Text style={{ fontSize: 14 }}>zł</Text>
                </Text>
              </View>
            )}
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    </AnimatedPressable>
  );
}
