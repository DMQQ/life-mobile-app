import { useNavigation } from "@react-navigation/native";
import useRemoveTimelineMutation from "../hooks/mutation/useRemoveTimelineMutation";
import moment from "moment";
import Ripple from "react-native-material-ripple";
import {
  Alert,
  StyleProp,
  Text,
  ToastAndroid,
  View,
  ViewStyle,
} from "react-native";
import timelineStyles from "./timeline.styles";
import { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery";
import Colors from "../../../../constants/Colors";
import { useMemo } from "react";
import CompletionBar from "./CompletionBar";

export default function TimelineItem(
  timeline: GetTimelineQuery & {
    location: "timeline" | "root";
    textColor?: string;
    styles?: StyleProp<ViewStyle>;
  }
) {
  const { remove } = useRemoveTimelineMutation(timeline);

  const navigation = useNavigation<any>();

  const onPress = () => {
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
      ]
    );
  };

  const isExpired = useMemo(
    () =>
      moment(moment(), "hh:mm:ss").isAfter(
        moment(timeline.endTime, "hh:mm:ss")
      ) ||
      moment(moment(), "YYYY-MM-DD").isAfter(moment(timeline.date), "date"),
    []
  );

  return (
    <Ripple
      onLongPress={onLongPress}
      onPress={onPress}
      style={[timelineStyles.itemContainer, timeline.styles]}
    >
      <View style={{ flex: 1 }}>
        <View style={[timelineStyles.itemContainerTitleRow]}>
          <Text
            numberOfLines={1}
            style={[
              timelineStyles.itemTitle,
              { ...(timeline.textColor && { color: timeline.textColor }) },
            ]}
          >
            {timeline.title}
          </Text>
          <Text
            style={[
              timelineStyles.itemTimeLeft,
              { ...(timeline.textColor && { color: timeline.textColor }) },
            ]}
          >
            {start} - {end}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "flex-end",
            marginTop: 5,
          }}
        >
          <Text
            numberOfLines={3}
            style={[
              timelineStyles.itemDescription,
              { flex: 1 },
              { ...(timeline.textColor && { color: timeline.textColor }) },
            ]}
          >
            {timeline.description}
          </Text>
          {timeline.location === "timeline" && (
            <Text
              style={[
                timelineStyles.status,
                {
                  backgroundColor: timeline.isCompleted
                    ? "lightgreen"
                    : isExpired
                    ? "#BA4343"
                    : Colors.secondary,
                  alignSelf: "flex-end",
                },
              ]}
            >
              {timeline.isCompleted ? "Finished" : isExpired ? "Late" : "To do"}
            </Text>
          )}
        </View>
      </View>
    </Ripple>
  );
}
