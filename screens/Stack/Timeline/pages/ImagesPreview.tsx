import { Gesture, GestureDetector } from "react-native-gesture-handler";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { InteractionManager, ScrollView, Text } from "react-native";
import Layout from "@/constants/Layout";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import useGetTimelineById from "../hooks/query/useGetTimelineById";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { IFile, Timeline } from "@/types";
import Url from "@/constants/Url";
import useGoBackOnBackPress from "@/utils/hooks/useGoBackOnBackPress";
import { TimelineScreenProps } from "../types";
import Ripple from "react-native-material-ripple";
import { AntDesign, Feather } from "@expo/vector-icons";

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

  console.log(data.images, route.params.selectedImage);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerTransparent: true,
      headerRight: () =>
        currentImageIndex + 1 < data.images.length ? (
          <Ripple
            style={{ paddingRight: 10 }}
            onPress={() =>
              navigation.push("ImagesPreview", {
                timelineId: route.params.timelineId,
                selectedImage: data.images[currentImageIndex + 1],
              })
            }
          >
            <Text style={{ color: "#fff" }}>Next</Text>
          </Ripple>
        ) : null,
    });
  }, [data.images, route.params.selectedImage]);

  return (
    <ScreenContainer
      style={{ justifyContent: "center", alignItems: "center", padding: 0 }}
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

  const [enableGesture, setEnableGesture] = useState(false);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setEnableGesture(true);
    });
  }, []);

  const handleGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = event.scale;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onEnd(() => (scale.value = withTiming(1)))
    .enabled(enableGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: focalX.value },
      { translateY: focalY.value },
      { translateX: -Layout.window.width / 2 },
      { translateY: -Layout.window.height / 2 },
      { scale: scale.value },
      { translateX: -focalX.value },
      { translateY: -focalY.value },
      { translateX: Layout.window.width / 2 },
      { translateY: Layout.window.height / 2 },
    ] as any,
  }));

  return (
    <GestureDetector gesture={handleGesture}>
      <Animated.Image
        source={src}
        style={[
          {
            width: Layout.screen.width,
            height: Layout.screen.height - 80,
          },
          animatedStyle,
        ]}
        resizeMode="contain"
      />
    </GestureDetector>
  );
};
