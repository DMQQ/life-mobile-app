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
import { MaterialCommunityIcons } from "@expo/vector-icons";

const backgroundColor = Colors.primary_lighter;

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
  },

  headContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Color(Colors.secondary).alpha(0.1).string(),
    padding: 8,
    paddingLeft: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  actionButtonText: {
    color: Colors.secondary,
    marginRight: 4,
    fontSize: Sizing.tooltip,
  },
});

export default function TodaysTimelineEvents(props: { data: any[]; loading: boolean }) {
  const navigation = useNavigation<any>();

  const date = moment();

  const isEmpty = props?.data?.length === 0 && !props.loading;

  if (isEmpty)
    return (
      <View style={styles.container}>
        <Text style={[styles.heading, { marginBottom: 10 }]}>Daily events</Text>
        <NotFound selectedDate={date.format(DATE_FORMAT)} />
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.headContainer}>
        <Text style={styles.heading}>For today</Text>

        <Ripple style={styles.actionButton} onPress={() => navigation.navigate("TimelineScreens")}>
          <Text style={styles.actionButtonText}>See more</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.secondary} />
        </Ripple>
      </View>

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

      <View style={[styles.headContainer, { marginTop: 20 }]}>
        <Text style={styles.heading}>Missed events</Text>

        <Ripple style={styles.actionButton} onPress={() => navigation.navigate("TimelineScreens")}>
          <Text style={styles.actionButtonText}>See more</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.secondary} />
        </Ripple>
      </View>
    </View>
  );
}
