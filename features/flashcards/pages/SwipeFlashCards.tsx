import Header from "@/components/ui/Header/Header";
import { View } from "react-native";

export default function SwipeFlashCardsScreen({ navigation, route }: any) {
  const { flashCards, reviewFlashCard } = useFlashCards(route.params?.groupId);

  const [cards, setCards] = useState(flashCards);

  const onSwipeLeft = (id: string) => {
    setCards((prev) => prev.slice(1));

    reviewFlashCard(id, false);
  };

  const onSwipeRight = (id: string) => {
    setCards((prev) => prev.slice(1));

    reviewFlashCard(id, true);
  };

  useEffect(() => {
    if (cards.length === 0) {
      alert("No more cards to review, go back to the previous screen or start a new session.");

      //   setCards(flashCards);

      navigation.goBack();
    }
  }, [cards]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Swipe Flashcards" goBack buttons={[]} />

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {cards.map((card, index) => (
          <SwipeableCard
            key={card.id}
            card={card}
            index={index}
            onSwipeLeft={() => onSwipeLeft(card.id)}
            onSwipeRight={() => onSwipeRight(card.id)}
            totalLength={flashCards.length}
          />
        ))}
      </View>
      <View>
        <ProggressBar max={flashCards.length} current={cards.length} />
      </View>
    </SafeAreaView>
  );
}

import React, { useEffect, useState } from "react";
import { StyleSheet, Dimensions, Text, SafeAreaView } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  withTiming,
  FadeInDown,
  runOnJS,
} from "react-native-reanimated";
import { FlashCard, useFlashCards } from "../hooks";
import Colors from "@/constants/Colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

interface SwipeableCardProps {
  card: FlashCard;
  index: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  totalLength: number;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({ card, index, onSwipeLeft, onSwipeRight, totalLength }) => {
  const position = useSharedValue({ x: 0, y: 0 });

  const panGesture = Gesture.Pan()
    .onChange(({ translationX, translationY }) => {
      position.value = {
        x: translationX,
        y: translationY,
      };
    })
    .onEnd(() => {
      if (position.value.x > SCREEN_WIDTH * 0.3) {
        position.value = withSpring({ x: SCREEN_WIDTH + 100, y: 100 }, { duration: 250 });
        runOnJS(onSwipeRight)();
      } else if (position.value.x < -SCREEN_WIDTH * 0.3) {
        position.value = withSpring({ x: -SCREEN_WIDTH - 100, y: 100 }, { duration: 250 });
        runOnJS(onSwipeLeft)();
      } else {
        position.value = withSpring({ x: 0, y: 0 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(position.value.x, [-SCREEN_WIDTH * 0.3, 0, SCREEN_WIDTH * 0.3], [-15, 0, 15], Extrapolation.CLAMP);

    return {
      transform: [{ translateX: position.value.x }, { translateY: position.value.y }, { rotate: `${rotate}deg` }],
    };
  }, [index]);

  const stackStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateY: withTiming(index * -15, {
            duration: 100,
          }),
        },
        {
          scale: withTiming(1 - index * 0.05, {
            duration: 100,
          }),
        },
      ],
      opacity: withTiming(1 - index * 0.2),
    }),
    [index]
  );

  if (index >= 3) return null;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.cardWrapper, { zIndex: totalLength - index }, cardStyle]} entering={FadeInDown.duration(100)}>
        <Animated.View style={[styles.card, stackStyle]}>
          <FlipCard
            showExpand={false}
            backContent={card.answer}
            frontContent={card.question}
            explanation={card.explanation || ""}
            container={{ width: "100%", height: "100%" }}
            groupId=""
          />

          <View style={{ padding: 25, width: "100%", position: "absolute", bottom: 0 }}>
            <SuccessBar correctAnswers={card.correctAnswers} incorrectAnswers={card.incorrectAnswers} />
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.1,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4,
    backgroundColor: Colors.primary_lighter,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardText: {
    color: "#fff",
    fontSize: 24,
    textAlign: "center",
    padding: 20,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "#444",
    borderRadius: 4,
    overflow: "hidden",
  },
  barForeground: {
    height: "100%",
  },
  text: {
    color: "#fff",
    fontSize: 12,
  },
});

import { interpolateColor, useDerivedValue } from "react-native-reanimated";
import FlipCard from "../components/FlashCards/FlashCard";
import SuccessBar from "../components/SuccessBar";

interface SuccessBarProps {
  max: number;
  current: number;
}

const ProggressBar: React.FC<SuccessBarProps> = ({ max, current }) => {
  const total = max;
  const percentage = useDerivedValue(() => {
    return withSpring((total - current) / total);
  });

  const barStyle = useAnimatedStyle(() => ({
    width: `${percentage.value * 100}%`,
    backgroundColor: "#fff",
  }));

  return (
    <View style={[styles.container, { paddingHorizontal: 30, paddingVertical: 15 }]}>
      <View style={styles.barBackground}>
        <Animated.View style={[styles.barForeground, barStyle]} />
      </View>
      <Text style={styles.text}>
        {total - current}/{max}
      </Text>
    </View>
  );
};
