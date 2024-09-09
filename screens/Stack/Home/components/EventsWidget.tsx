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
import TimelineItem from "../../Timeline/components/TimelineItem";
import lowOpacity from "@/utils/functions/lowOpacity";
import { DATE_FORMAT } from "@/utils/functions/parseDate";

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
  return (
    <>
      {props?.data?.slice(0, 3).map((timeline, index) => (
        <TimelineItem
          styles={{
            backgroundColor: Colors.primary_light,
            borderRadius: 15,
            padding: 20,
          }}
          key={timeline.id}
          location="root"
          {...timeline}
        />
      ))}
    </>
  );
};

export default function TodaysTimelineEvents(props: { data: any[]; loading: boolean }) {
  const navigation = useNavigation<any>();

  const date = moment();

  return (
    <View style={styles.container}>
      <View style={styles.headContainer}>
        <Text style={styles.heading}>
          {moment.weekdays()[date.day()]} {date.format("DD.MM")}
        </Text>
        <Ripple onPress={() => navigation.navigate("TimelineScreens")} style={styles.button}>
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

      {props?.data?.length === 0 && !props.loading && <NotFound selectedDate={date.format(DATE_FORMAT)} />}
    </View>
  );
}
