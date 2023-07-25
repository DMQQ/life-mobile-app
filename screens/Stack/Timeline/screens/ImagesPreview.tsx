import { Gesture, GestureDetector } from "react-native-gesture-handler";
import ScreenContainer from "../../../../components/ui/ScreenContainer";
import { ScrollView, ImageBackground } from "react-native";
import Layout from "../../../../constants/Layout";
import { useLayoutEffect, useRef } from "react";
import useGetTimelineById from "../hooks/query/useGetTimelineById";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { IFile } from "../../../../types";
import Url from "../../../../constants/Url";
import useGoBackOnBackPress from "../../../../utils/hooks/useGoBackOnBackPress";

export default function ImagesPreview({ route }: any) {
  const { data } = useGetTimelineById(route.params.timelineId! as string, {
    fetchPolicy: "cache-only",
  });

  const scrollRef = useRef<ScrollView | null>(null);

  useLayoutEffect(() => {
    const index = data?.images.findIndex(
      (el: IFile) => el.url === route.params.selectedImage
    );
    scrollRef.current?.scrollTo({
      x: index! * Layout.window.width,
      y: 0,
      animated: false,
    });
  }, []);

  useGoBackOnBackPress();

  return (
    <ScreenContainer
      style={{ justifyContent: "center", alignItems: "center", padding: 0 }}
    >
      <ScrollView
        contentContainerStyle={{
          justifyContent: "center",
        }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        ref={scrollRef}
        style={{ flex: 1 }}
        pagingEnabled
        horizontal
      >
        {data?.images.map((el: IFile) => (
          <GesturedImage key={el.id} uri={el.url} />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const GesturedImage = (props: { uri: string }) => {
  const scale = useSharedValue(1);

  const focalX = useSharedValue(0);
  const focalY = useSharedValue(-50);

  const src = { uri: Url.API + "/upload/images/" + props.uri };

  const handleGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = event.scale;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onEnd(() => (scale.value = withTiming(1)));

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
    ],
  }));

  const finalGesture = Gesture.Race(handleGesture);

  return (
    <ImageBackground source={src} blurRadius={20}>
      <GestureDetector gesture={finalGesture}>
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
    </ImageBackground>
  );
};
