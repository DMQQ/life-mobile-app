import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, interpolate } from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CarouselItemProps {
  index: number;
  scrollX: Animated.SharedValue<number>;
  children: React.ReactNode;
  itemWidth: number;
  gap: number;

  isFlipped?: boolean;
}

const CarouselItem: React.FC<CarouselItemProps> = ({ index, scrollX, children, itemWidth, gap, isFlipped = false }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * (itemWidth + gap), index * (itemWidth + gap), (index + 1) * (itemWidth + gap)];

    const scale = interpolate(scrollX.value, inputRange, [0.95, isFlipped ? 1 : 1.05, 0.95], "clamp");

    const opacity = interpolate(scrollX.value, inputRange, [0.7, 1, 0.7], "clamp");

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return <Animated.View style={[{ width: itemWidth, marginHorizontal: gap / 2 }, animatedStyle]}>{children}</Animated.View>;
};

interface CarouselItem {
  id: string;
  content: React.ReactNode;
}

interface SnapCarouselProps {
  items: CarouselItem[];
  itemWidth?: number;
  gap?: number;
}

const SnapCarousel: React.FC<SnapCarouselProps> = ({ items, itemWidth = SCREEN_WIDTH * 0.8, gap = 20 }) => {
  const scrollX = useSharedValue(0);
  const ITEM_SPACING = (SCREEN_WIDTH - itemWidth) / 2 - gap;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth + gap}
        decelerationRate="fast"
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: ITEM_SPACING }]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        pagingEnabled
      >
        {items.map((item, index) => (
          <CarouselItem key={item.id} index={index} scrollX={scrollX} itemWidth={itemWidth} gap={gap}>
            {item.content}
          </CarouselItem>
        ))}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    height: 250,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SnapCarousel;
