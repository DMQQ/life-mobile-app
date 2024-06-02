import Layout from "@/constants/Layout";
import { SharedTransition, withTiming } from "react-native-reanimated";

export const transition = SharedTransition.custom((values) => {
  "worklet";

  return {
    height: withTiming(values.targetHeight, { duration: 150 }),
    width: withTiming(values.targetWidth, { duration: 150 }),
    originX: withTiming(values.targetOriginX, { duration: 150 }),
    originY: withTiming(values.targetOriginY, { duration: 150 }),
  };
});
