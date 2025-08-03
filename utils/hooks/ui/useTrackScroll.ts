import { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";

export default function useTrackScroll() {
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return [scrollY, onScroll] as const;
}
