import * as React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";

type Size = {
  width: number;
  height: number;
};

interface SkeletonProps {
  children: React.ReactElement;
  backgroundColor?: string;
  highlightColor?: string;
  marginVertical?: number;
  marginHorizontal?: number;
  size?: ((props: Size) => Size) | Size;
}

const dims = Dimensions.get("screen");

const Skeleton = ({
  children,
  backgroundColor = "#1f2b3d",
  highlightColor = "#2a3a52",
  size,
  marginHorizontal,
  marginVertical,
}: SkeletonProps) => {
  const shared = useSharedValue(0);

  const { width, height } =
    typeof size === "undefined"
      ? dims
      : typeof size === "function"
      ? size(dims)
      : size;

  React.useEffect(() => {
    shared.value = withRepeat(withTiming(1, { duration: 750 }), Infinity);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shared.value,
          [0, 1],
          [size ? -width : 0, size ? width : 0]
        ),
      },
    ],
  }));

  return (
    <Reanimated.View
      style={{ width, height, marginVertical, marginHorizontal }}
    >
      <MaskedView
        androidRenderingMode="hardware"
        maskElement={children}
        style={{
          width,
          height,
        }}
      >
        <View style={[styles.background, { backgroundColor }]} />
        <Reanimated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
          <MaskedView
            style={StyleSheet.absoluteFill}
            maskElement={
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
                colors={["transparent", "black", "transparent"]}
              />
            }
          >
            <Reanimated.View
              entering={FadeIn}
              exiting={FadeOut}
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: highlightColor },
              ]}
            />
          </MaskedView>
        </Reanimated.View>
      </MaskedView>
    </Reanimated.View>
  );
};

interface ItemProps {
  width: ((width: number) => number) | number;
  height: ((height: number) => number) | number;
  margin?: number;
  marginRight?: number;

  marginTop?: number;
}

Skeleton.Item = ({
  width,
  height,
  margin,
  marginRight,
  marginTop,
}: ItemProps) => (
  <View
    style={[
      styles.item,
      {
        margin,
        width: typeof width === "function" ? width(dims.width) : width,
        height: typeof height === "function" ? height(dims.height) : height,
        marginRight,
        marginTop: marginTop ?? 10,
      },
    ]}
  />
);

const styles = StyleSheet.create({
  background: {
    flexGrow: 1,
    overflow: "hidden",
  },
  item: {
    marginTop: 10,
    backgroundColor: "lightgrey",
    borderRadius: 5,
  },
});

export default Skeleton;
