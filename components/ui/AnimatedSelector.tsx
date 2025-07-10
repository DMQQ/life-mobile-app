import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/Colors";
import lowOpacity from "@/utils/functions/lowOpacity";
import Color from "color";
import { Button } from "@/components";
import Layout from "@/constants/Layout";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import Feedback from "react-native-haptic-feedback";

interface AnimatedSelectorProps<T> {
  items: T[];
  selectedItem: T;
  onItemSelect: (item: T) => void;
  renderItem?: (item: T) => string;
  buttonWidth?: number;
  containerStyle?: any;
  buttonStyle?: any;
  textStyle?: any;
  selectorColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
  hapticFeedback?: boolean;
  scale?: number;
}

const blueText = Color(Colors.primary).lighten(10).string();

export default function AnimatedSelector<T>({
  items,
  selectedItem,
  onItemSelect,
  renderItem = (item) => String(item),
  buttonWidth,
  containerStyle,
  buttonStyle,
  textStyle,
  selectorColor = lowOpacity(Colors.secondary, 0.15),
  activeTextColor = Colors.secondary,
  inactiveTextColor = blueText,
  hapticFeedback = true,
  scale = 1,
}: AnimatedSelectorProps<T>) {
  const calculatedButtonWidth = buttonWidth || Math.max(80, (Layout.screen.width - 30 - 5 * (items.length - 1)) / items.length);
  const activeIndex = items.indexOf(selectedItem);

  const indicatorPosition = useSharedValue(activeIndex * (calculatedButtonWidth + 5));
  const buttonScale = useSharedValue(1);

  React.useEffect(() => {
    const newIndex = items.indexOf(selectedItem);
    indicatorPosition.value = withSpring(newIndex * (calculatedButtonWidth + 5), {
      damping: 20,
      stiffness: 150,
    });

    buttonScale.value = withSequence(withTiming(0.95, { duration: 100 }), withTiming(1, { duration: 150 }));

    if (hapticFeedback) {
      runOnJS(Feedback.trigger)("impactLight");
    }
  }, [selectedItem]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }],
    width: calculatedButtonWidth,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale }],
  }));

  const SelectorButton = ({ item, index }: { item: T; index: number }) => {
    const isActive = selectedItem === item;

    const buttonAnimatedStyle = useAnimatedStyle(() => {
      const scale = isActive ? buttonScale.value : 1;
      return {
        transform: [{ scale }],
      };
    });

    const textAnimatedStyle = useAnimatedStyle(() => {
      const translateY = isActive ? interpolate(buttonScale.value, [1, 1.1, 1], [0, -1, 0]) : 0;
      return {
        transform: [{ translateY }],
      };
    });

    return (
      <Animated.View style={buttonAnimatedStyle}>
        <Button
          variant="text"
          onPress={() => onItemSelect(item)}
          style={[
            styles.button,
            {
              width: calculatedButtonWidth,
              marginRight: index < items.length - 1 ? 5 : 0,
            },
            buttonStyle,
            {
              borderWidth: 0,
              backgroundColor: "transparent",
            },
          ]}
        >
          <Animated.Text
            style={[
              textAnimatedStyle,
              {
                fontSize: 14,
                color: isActive ? activeTextColor : inactiveTextColor,
                fontWeight: isActive ? "600" : "400",
              },
              textStyle,
            ]}
          >
            {renderItem(item)}
          </Animated.Text>
        </Button>
      </Animated.View>
    );
  };

  return (
    <Animated.View style={[styles.container, containerStyle, containerAnimatedStyle]}>
      <ScrollView
        keyboardDismissMode="on-drag"
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.selector, { backgroundColor: selectorColor }, indicatorStyle]} />
        {items.map((item, index) => (
          <SelectorButton key={`${renderItem(item)}-${index}`} item={item} index={index} />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  scrollView: {
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    position: "relative",
  },
  selector: {
    position: "absolute",
    height: 40,
    borderRadius: 7.5,
    top: 0,
    zIndex: 0,
    borderWidth: 1,
    borderColor: lowOpacity(Colors.secondary, 0.5),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    padding: 10,
    paddingHorizontal: 15,
    borderRadius: 7.5,
    backgroundColor: Colors.primary_light,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    borderWidth: 0.5,
    borderColor: Colors.primary,
  },
});
