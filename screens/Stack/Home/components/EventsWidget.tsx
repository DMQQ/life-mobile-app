import { StyleSheet, Text, View } from "react-native";
import TimelineItem from "../../Timeline/components/TimelineItem";
import Colors, { Sizing } from "../../../../constants/Colors";
import { useNavigation } from "@react-navigation/native";
import Ripple from "react-native-material-ripple";
import moment from "moment";
import { Padding, Rounded } from "../../../../constants/Layout";
import NotFound from "./NotFound";
import { GetTimelineQuery } from "../../Timeline/hooks/query/useGetTimeLineQuery";
import Skeleton from "@/components/SkeletonLoader/Skeleton";
import Color from "color";

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
    marginBottom: 15,
  },

  heading: {
    color: "#fff",
    fontSize: Sizing.subHead,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#fff",
    borderRadius: 100,
    padding: 5,
    paddingHorizontal: 10,
  },
  buttonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "bold",
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

const EventsList = (props: { data: GetTimelineQuery[] }) => (
  <>
    {props?.data?.slice(0, 3).map((timeline) => (
      <TimelineItem
        styles={{
          backgroundColor: Colors.primary_lighter,
          borderRadius: 15,
          paddingHorizontal: 20,
        }}
        textColor={"#fff"}
        location="root"
        key={timeline.id}
        {...timeline}
      />
    ))}
  </>
);

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
