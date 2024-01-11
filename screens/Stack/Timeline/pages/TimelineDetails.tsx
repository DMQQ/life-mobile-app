import { Text, View } from "react-native";

import { StackScreenProps } from "../../../../types";
import { gql, useMutation } from "@apollo/client";
import useUser from "../../../../utils/hooks/useUser";
import Colors from "../../../../constants/Colors";
import Color from "color";
import FileList from "../components/FileList";
import useGetTimelineById, {
  GET_TIMELINE,
} from "../hooks/query/useGetTimelineById";
import Ripple from "react-native-material-ripple";
import Layout from "../../../../constants/Layout";
import { AntDesign } from "@expo/vector-icons";
import TimelineTodos from "../components/TimelineTodos";
import LoaderSkeleton from "../components/LoaderSkeleton";
import useGoBackOnBackPress from "../../../../utils/hooks/useGoBackOnBackPress";
import Animated, {
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Layout as LayoutAnim,
  FadeIn,
  withDelay,
} from "react-native-reanimated";

const COMPLETE_TIMELINE = gql`
  mutation CompleteTimeline($id: String!) {
    completeTimeline(id: $id) {
      id
      title
      description
      date
      beginTime
      endTime
      isCompleted
      isAllDay
    }
  }
`;

const AnimatedRipple = Animated.createAnimatedComponent(Ripple);

const Header = (props: {
  navigation: any;
  isCompleted: boolean;
  onTaskToggle: Function;
  scrollY: SharedValue<number>;
  title: string;
}) => {
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: props.scrollY.value > 40 ? withTiming(1) : withTiming(0),
  }));

  const buttonTextHideStyle = useAnimatedStyle(() =>
    props.isCompleted
      ? {
          opacity:
            props.scrollY.value > 40
              ? withTiming(0, { duration: 100 })
              : withDelay(200, withTiming(1)),
          display: props.scrollY.value > 40 ? "none" : "flex",
        }
      : {}
  );

  return (
    <View
      style={{
        width: Layout.screen.width,
        height: 60,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
      }}
    >
      <Ripple onPress={() => props.navigation.goBack()} style={{ padding: 10 }}>
        <AntDesign name="arrowleft" size={20} color={"#fff"} />
      </Ripple>

      <Animated.Text
        layout={LayoutAnim}
        style={[
          { color: "#fff", fontSize: 20, fontWeight: "bold" },
          titleAnimatedStyle,
        ]}
      >
        {props.title}
      </Animated.Text>

      <AnimatedRipple
        layout={LayoutAnim}
        disabled={props.isCompleted}
        onPress={() => props.onTaskToggle()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: Colors.secondary,
          padding: 5,
          paddingHorizontal: 10,
          borderRadius: 100,
        }}
      >
        {props.isCompleted && (
          <AntDesign name="checkcircle" size={18} color={"#fff"} />
        )}
        <Animated.Text
          entering={FadeIn.delay(100)}
          style={[
            { fontSize: 16, fontWeight: "600", color: "#fff", marginLeft: 5 },
            buttonTextHideStyle,
          ]}
        >
          {props.isCompleted ? "Finished" : "Not Completed"}
        </Animated.Text>
      </AnimatedRipple>
    </View>
  );
};

export default function TimelineDetails({
  route,
  navigation,
}: StackScreenProps<
  { TimelineDetails: { timelineId: string } },
  "TimelineDetails"
>) {
  const usr = useUser();

  const ctx = {
    context: {
      headers: {
        authentication: usr?.token,
      },
    },
  };

  const { data, loading } = useGetTimelineById(route.params.timelineId);

  const [completeTimeline] = useMutation(COMPLETE_TIMELINE, {
    ...ctx,
    variables: {
      id: route.params.timelineId,
    },
    refetchQueries: [
      { query: GET_TIMELINE, variables: { id: route.params.timelineId } },
    ],
    onError(err) {
      console.log(JSON.stringify(err, null, 2));
    },
  });

  useGoBackOnBackPress();

  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll(event) {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <>
      <Header
        title={data?.title.slice(0, 20)}
        scrollY={scrollY}
        isCompleted={data?.isCompleted}
        onTaskToggle={completeTimeline}
        navigation={navigation}
      />
      <Animated.ScrollView style={{ padding: 10 }} onScroll={onScroll}>
        {loading ? (
          <LoaderSkeleton />
        ) : (
          <View>
            <Text
              style={{
                marginBottom: 5,
                fontSize: 35,
                fontWeight: "bold",
                color: Colors.secondary,
              }}
            >
              {data?.title}
            </Text>

            <Text
              style={{
                fontSize: 20,
                marginTop: 5,
                color: Color(Colors.primary).lighten(5).string(),
              }}
            >
              {data?.description}
            </Text>

            <TimelineTodos timelineId={data?.id} todos={data?.todos || []} />

            <FileList timelineId={data?.id} />
          </View>
        )}
      </Animated.ScrollView>
    </>
  );
}
