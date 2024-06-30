import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors, { Sizing } from "../../../../constants/Colors";
import { useNavigation } from "@react-navigation/native";
import Ripple from "react-native-material-ripple";
import moment from "moment";
import { Padding, Rounded } from "../../../../constants/Layout";
import NotFound from "./NotFound";
import { GetTimelineQuery } from "../../Timeline/hooks/query/useGetTimeLineQuery";
import Skeleton from "@/components/SkeletonLoader/Skeleton";
import Color from "color";
import Button from "@/components/ui/Button/Button";

const backgroundColor = Colors.primary_lighter;

const styles = StyleSheet.create({
  container: {
    padding: Padding.xxl,
    marginTop: 15,
    backgroundColor,
    borderRadius: Rounded.xxl,
  },

  headContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },

  heading: {
    color: "#fff",
    fontSize: Sizing.subHead,
    fontWeight: "bold",
  },
  button: {
    borderRadius: 100,
    padding: 5,
    paddingHorizontal: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
  },

  notFoundContainer: {
    flexDirection: "column",
  },

  notFoundText: {
    fontSize: 20,
    padding: 10,
    fontWeight: "bold",
    color: "#fff",
  },
});

const EventsList = (props: { data: GetTimelineQuery[] }) => {
  const navigation = useNavigation<any>();
  return (
    <>
      {props?.data?.slice(0, 3).map((timeline, index) => (
        <Ripple
          onPress={() =>
            navigation.navigate("TimelineScreens", {
              timelineId: timeline.id,
            })
          }
          style={{
            marginBottom: index === 2 ? 0 : 15,
            padding: 10,
            backgroundColor: Color(Colors.primary_lighter)
              .lighten(0.5)
              .string(),
            borderRadius: 15,
            paddingHorizontal: 15,
          }}
          key={timeline.id}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 20 }}>
            {timeline.title}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 15 }}>
            {timeline.description.replaceAll("\n", "")}
          </Text>

          <Text style={{ color: "rgba(255,255,255,0.6)" }}>
            {timeline.beginTime} to {timeline.endTime}
          </Text>
        </Ripple>
      ))}

      {props?.data?.length > 0 && (
        <Button
          onPress={() => navigation.navigate("TimelineCreate")}
          fontStyle={{ fontSize: 16 }}
          style={{ marginTop: 15 }}
        >
          Create Event
        </Button>
      )}
    </>
  );
};

export default function TodaysTimelineEvents(props: {
  data: any[];
  loading: boolean;
}) {
  const navigation = useNavigation<any>();

  const date = moment();

  return (
    <View style={styles.container}>
      <View style={styles.headContainer}>
        <Text style={styles.heading}>
          {moment.weekdays()[date.day()]} {date.format("DD.MM")}
        </Text>
        <Ripple
          onPress={() => navigation.navigate("TimelineScreens")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>See more</Text>
        </Ripple>
      </View>

      <EventsList data={props.data || []} />

      {props.loading && (
        <Skeleton
          size={({ width, height }) => ({
            height: 150,
            width,
          })}
          backgroundColor={Color(Colors.primary_lighter).lighten(0.5).string()}
          highlightColor={Colors.secondary}
        >
          <View>
            <Skeleton.Item width={(w) => w - 70} height={40} />
            <Skeleton.Item width={(w) => w - 70} height={40} />
            <Skeleton.Item width={(w) => w - 70} height={40} />
            <Skeleton.Item width={(w) => w - 70} height={40} />
          </View>
        </Skeleton>
      )}

      {props?.data?.length === 0 && !props.loading && <NotFound />}
    </View>
  );
}
