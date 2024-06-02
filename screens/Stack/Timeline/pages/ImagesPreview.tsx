import { Gesture, GestureDetector } from "react-native-gesture-handler";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { InteractionManager, Text, Image, Dimensions } from "react-native";
import Layout from "@/constants/Layout";
import { useEffect, useLayoutEffect, useState } from "react";
import useGetTimelineById from "../hooks/query/useGetTimelineById";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Url from "@/constants/Url";
import { TimelineScreenProps } from "../types";
import Ripple from "react-native-material-ripple";
import { transition } from "../sharedTransition";

export default function ImagesPreview({
  route,
  navigation,
}: TimelineScreenProps<"ImagesPreview">) {
  const { data } = useGetTimelineById(route.params.timelineId! as string, {
    fetchPolicy: "cache-only",
  });

  const currentImageIndex = data.images.findIndex(
    (img: { id: string; url: string }) => img.url === route.params.selectedImage
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        currentImageIndex + 1 < data.images.length ? (
          <Ripple
            style={{ paddingRight: 10 }}
            onPress={() => {
              InteractionManager.runAfterInteractions(() => {
                navigation.setParams({
                  selectedImage: data.images[currentImageIndex + 1].url,
                  timelineId: route.params.timelineId,
                });
              });
            }}
          >
            <Text style={{ color: "#fff" }}>Next</Text>
          </Ripple>
        ) : null,
    });
  }, [data.images, route.params.selectedImage]);

  return (
    <ScreenContainer
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 0,
        backgroundColor: "rgba(0,0,0,0.75)",
      }}
    >
      <GesturedImage uri={route.params.selectedImage} />
    </ScreenContainer>
  );
}

const GesturedImage = (props: { uri: string }) => {
  const scale = useSharedValue(1);

  const focalX = useSharedValue(0);
  const focalY = useSharedValue(-50);

  const src = { uri: Url.API + "/upload/images/" + props.uri };

  const dimenstions = useSharedValue({ width: 0, height: 0 });

  useLayoutEffect(() => {
    Image.getSize(src.uri, (width, height) => {
      const imageRatio = width / height;
      const screenWidth = Layout.window.width;
      const screenHeight = Layout.window.height;

      if (imageRatio > screenWidth / screenHeight) {
        dimenstions.value = {
          width: screenWidth,
          height: screenWidth / imageRatio,
        };
      } else {
        dimenstions.value = {
          width: screenHeight * imageRatio,
          height: screenHeight,
        };
      }
    });
  }, [props.uri]);

  const handlePinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = event.scale;

      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withTiming(1);
      } else if (scale.value > 3) {
        scale.value = withTiming(2);
      }
    });

  const handlePanGesture = Gesture.Pan().onUpdate((event) => {
    // focalX.value = event.translationX;
    // focalY.value = event.translationY;
  });

  // .onEnd(() => (scale.value = withTiming(1)));

  const animatedDims = useAnimatedStyle(() => ({
    width: dimenstions.value.width,
    height: dimenstions.value.height,
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: focalX.value },
      { translateY: focalY.value },
      { translateX: -Layout.window.width / 2 },
      { translateY: -Layout.window.height / 4 },
      { scale: scale.value },
      { translateX: -focalX.value },
      { translateY: -focalY.value },
      { translateX: Layout.window.width / 2 },
      { translateY: Layout.window.height / 4 },
    ] as any,
  }));

  const handleGesture = Gesture.Race(handlePinchGesture);

  return (
    <GestureDetector gesture={handleGesture}>
      <Animated.Image
        sharedTransitionStyle={transition}
        sharedTransitionTag={`image-${props.uri}`}
        source={src}
        style={[animatedDims, animatedStyle]}
      />
    </GestureDetector>
  );
};
