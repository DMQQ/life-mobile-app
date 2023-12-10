import { StyleSheet, Text, View } from "react-native";
import TimelineItem from "../../screens/Stack/Timeline/components/TimelineItem";
import Colors, { Sizing, randColor } from "../../constants/Colors";
import Color from "color";
import { useNavigation } from "@react-navigation/native";
import Ripple from "react-native-material-ripple";
import moment from "moment";
import { MaterialIcons } from "@expo/vector-icons";
import { Padding, Rounded } from "../../constants/Layout";
import Button from "../ui/Button/Button";

const styles = StyleSheet.create({
  container: {
    padding: Padding.xxl,
    marginTop: 15,
    backgroundColor: "#00C896",
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
    fontSize: 25,
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

export default function TodaysTimelineEvents(props: { data: any[] }) {
  const navigation = useNavigation<any>();

  const date = moment();

  return (
    <View style={styles.container}>
      <View style={styles.headContainer}>
        <Text style={styles.heading}>
          {moment.weekdays()[date.day()]} {date.format("MM.DD")}
        </Text>
        <Ripple
          onPress={() => navigation.navigate("TimelineScreens")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>See more</Text>
        </Ripple>
      </View>

      {props?.data?.slice(0, 3).map((timeline) => (
        <TimelineItem
          styles={{
            backgroundColor: "#ffffff25",
            borderRadius: 15,
            paddingHorizontal: 20,
          }}
          textColor={"#fff"}
          location="root"
          key={timeline.id}
          {...timeline}
        />
      ))}

      {props?.data?.length === 0 && (
        <View style={styles.notFoundContainer}>
          <View
            style={{
              flexDirection: "row",
              paddingVertical: 10,
              marginBottom: 10,
              alignItems: "center",
            }}
          >
            <MaterialIcons name="event-busy" size={50} color={"#fff"} />

            <Text style={styles.notFoundText}>
              No available events ({date.format("MM.DD")})
            </Text>
          </View>

          <Button
            onPress={() =>
              navigation.navigate("TimelineScreens", {
                screen: "TimelineCreate",
                params: {
                  selectedDate: moment().format("YYYY-MM-DD"),
                },
              })
            }
            size="xl"
            style={{ backgroundColor: "#fff", borderRadius: 15 }}
            fontStyle={{ color: Colors.primary }}
          >
            Create event
          </Button>
        </View>
      )}
    </View>
  );
}
