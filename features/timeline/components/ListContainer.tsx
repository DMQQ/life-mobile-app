import { useMemo } from "react";
import timelineStyles from "./timeline.styles";
import { Text, View } from "react-native";
import Ripple from "react-native-material-ripple";
import { Entypo } from "@expo/vector-icons";
import TimelineItem from "./TimelineItem";
import Colors from "@/constants/Colors";

const ListContainer = (props: {
  list: any[];
  onPress: () => void;
  navigation: any;
  date: string;
}) => {
  const data = useMemo(
    () =>
      [...props?.list]?.sort((a, b) => {
        return (a.isCompleted ? 1 : 0) - (b.isCompleted ? 1 : 0);
      }),
    [props.list]
  );

  return (
    <View style={timelineStyles.listHeading}>
      <View style={timelineStyles.listHeadingContainer}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={timelineStyles.listHeadingText}>My events</Text>

          <Ripple
            style={{ padding: 2.5, marginLeft: 10 }}
            onPress={() =>
              props.navigation.navigate("Schedule", {
                selectedDate: props.date,
              })
            }
          >
            <Entypo name="list" color={Colors.foreground} size={25} />
          </Ripple>
        </View>

        <Ripple
          style={{
            padding: 7.5,
            paddingHorizontal: 10,
            backgroundColor: Colors.secondary,
            borderRadius: 25,
          }}
          onPress={props.onPress}
        >
          <Text style={{ color: Colors.foreground, fontWeight: "bold", fontSize: 13 }}>
            CREATE EVENT
          </Text>
        </Ripple>
      </View>

      {data.map((timeline) => (
        <TimelineItem
          styles={{
            backgroundColor: Colors.primary_lighter,
            borderRadius: 15,
            padding: 20,
            marginBottom: 10,
          }}
          key={timeline.id}
          location="timeline"
          {...timeline}
        />
      ))}
    </View>
  );
};

export default ListContainer;
