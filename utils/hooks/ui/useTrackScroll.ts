import { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useScrollYContext } from "@/utils/context/ScrollYContext";

interface UseTrackScrollOptions {
  useGlobal?: boolean;
  screenName?: string;
}

export default function useTrackScroll(options: UseTrackScrollOptions = {}) {
  const { useGlobal = true, screenName } = options;
  
  // Local scroll tracking (legacy mode)
  const localScrollY = useSharedValue(0);
  const localOnScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      localScrollY.value = event.contentOffset.y;
    },
  });

  if (useGlobal) {
    try {
      const { scrollY, onScroll, setActiveScreen } = useScrollYContext();
      
      // Set active screen when this hook is used
      if (screenName) {
        setActiveScreen(screenName);
      }
      
      return [scrollY, onScroll] as const;
    } catch (error) {
      // Fallback to local tracking if context is not available
      console.warn("ScrollYContext not available, falling back to local scroll tracking");
      return [localScrollY, localOnScroll] as const;
    }
  }

  // Legacy mode - local tracking only
  return [localScrollY, localOnScroll] as const;
}
