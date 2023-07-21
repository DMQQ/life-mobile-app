import { useNavigation } from "@react-navigation/native";
import useRemoveTimelineMutation from "../hooks/mutation/useRemoveTimelineMutation";
import moment from "moment";
import Ripple from "react-native-material-ripple";
import { Alert, Text, ToastAndroid, View } from "react-native";
import timelineStyles from "./timeline.styles";
import Colors from "../../../../constants/Colors";
import { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery";

export default function TimelineItem(
  timeline: GetTimelineQuery & { location: "timeline" | "root" }
) {
  const { loading, remove } = useRemoveTimelineMutation(timeline);

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

            ToastAndroid.show("Timeline deleted", ToastAndroid.SHORT);
          },
        },
      ]
    );
  };

  return (
    <Ripple
      onLongPress={onLongPress}
      onPress={onPress}
      style={[timelineStyles.itemContainer]}
    >
      <View style={{ flex: 1 }}>
        <View style={[timelineStyles.itemContainerTitleRow]}>
          <Text style={timelineStyles.itemTitle}>{timeline.title}</Text>
          <Text style={timelineStyles.itemTimeLeft}>
            {start} - {end}
          </Text>
        </View>
        <Text numberOfLines={2} style={timelineStyles.itemDescription}>
          {timeline.description}
        </Text>
      </View>
    </Ripple>
  );
}
