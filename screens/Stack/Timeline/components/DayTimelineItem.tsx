import { useNavigation } from "@react-navigation/native";
import useRemoveTimelineMutation from "../hooks/mutation/useRemoveTimelineMutation";
import moment from "moment";
import Ripple from "react-native-material-ripple";
import { Alert, StyleProp, Text, ToastAndroid, View, ViewStyle } from "react-native";
import timelineStyles from "./timeline.styles";
import { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery";
import { useMemo } from "react";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

export default function DayTimelineItem(
  timeline: GetTimelineQuery & {
    location: "timeline" | "root";
    textColor?: string;
    styles?: StyleProp<ViewStyle>;

    isSmall: boolean;
  }
) {
  const { remove } = useRemoveTimelineMutation(timeline);

  const navigation = useNavigation<any>();

  const onPress = () => {
    console.log("timeline", timeline);
    timeline.location === "root"
      ? navigation.navigate("TimelineScreens", {
          timelineId: timeline.id,
        })
      : navigation.navigate("TimelineDetails", {
          timelineId: timeline.id,
        });
  };

  const start = moment(timeline.beginTime, "HH:mm").format("HH:mm");

  const end = moment(timeline.endTime, "HH:mm").format("HH:mm");

  const onLongPress = async () => {
    Alert.alert(
      "Delete Timeline",
      "Are you sure you want to delete this timeline?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            await remove();

            ToastAndroid.show("Event deleted", ToastAndroid.SHORT);
          },
        },
      ],
      { userInterfaceStyle: "dark", cancelable: true }
    );
  };

  const isExpired = useMemo(() => {
    const now = moment();

    if (moment(timeline.date).isAfter(now)) return false;

    if (timeline.isCompleted) return false;

    const start = moment(timeline.beginTime, "HH:mm");
    const end = moment(timeline.endTime, "HH:mm");

    if (now.isAfter(end)) {
      return true;
    }

    if (now.isAfter(start) && now.isBefore(end)) {
      return false;
    }
  }, [timeline.date, timeline.beginTime, timeline.endTime, timeline.isCompleted]);

  return (
    <Ripple onLongPress={onLongPress} onPress={onPress} style={[timelineStyles.itemContainer, timeline.styles]}>
      <View style={{ flex: 1 }}>
        <View style={[timelineStyles.itemContainerTitleRow]}>
          <View style={{ flexDirection: "row", gap: 5 }}>
            <View>
              {timeline.isCompleted ? (
                <AntDesign name="check" color={"#fff"} size={18} />
              ) : isExpired ? (
                <AntDesign name="clockcircle" size={18} color={"#fff"} />
              ) : (
                <MaterialIcons name="pending" color={"#fff"} size={18} />
              )}
            </View>
            <Text
              numberOfLines={1}
              style={[timelineStyles.itemTitle, { fontSize: 16 }, { ...(timeline.textColor && { color: timeline.textColor }) }]}
            >
              {timeline.title}
            </Text>
          </View>
          <Text style={[timelineStyles.itemTimeLeft, { ...(timeline.textColor && { color: timeline.textColor }) }]}>
            {start} - {end}
          </Text>
        </View>
        {!timeline.isSmall && (
          <View
            style={{
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 2.5,
              gap: 10,
              flex: 1,
            }}
          >
            <Text
              numberOfLines={3}
              style={[
                timelineStyles.itemDescription,
                { flex: 1, fontSize: 14 },
                { ...(timeline.textColor && { color: timeline.textColor }) },
              ]}
            >
              {timeline.description}
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {timeline.todos.length > 0 && (
                <Text style={{ color: "#fff" }}>
                  {timeline.todos.length} {timeline.todos.length > 1 ? "todos" : "todo"}
                </Text>
              )}
              {timeline.images.length > 0 && (
                <Text style={{ color: "#fff" }}>
                  {timeline.images.length} {timeline.images.length > 1 ? "images" : "image"}
                </Text>
              )}
            </View>
          </View>
        )}
      </View>
    </Ripple>
  );
}
