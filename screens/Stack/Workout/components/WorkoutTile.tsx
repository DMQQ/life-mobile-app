import { StyleSheet, Text, View } from "react-native";
import Ripple from "react-native-material-ripple";
import Colors from "../../../../constants/Colors";
import { Workout } from "../../../../types";
import Color from "color";

const bgColor = Color(Colors.primary).lighten(0.5).string();

const styles = StyleSheet.create({
  tag: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    padding: 2.5,
    borderRadius: 10,
    marginRight: 5,
    fontWeight: "600",
  },
  workoutContainer: {
    backgroundColor: bgColor,
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },

  workoutTitle: {
    fontWeight: "bold",
    fontSize: 20,
    color: Colors.secondary,
    marginBottom: 7.5,
  },
});

const Tag = (props: { text: string }) => (
  <Text style={styles.tag}>{props.text}</Text>
);

export default function WorkoutTile(props: Workout & { navigation: any }) {
  return (
    <Ripple
      onPress={() =>
        props.navigation.navigate("Workout", {
          workoutId: props.workoutId,
        })
      }
      rippleColor={Colors.secondary}
      style={styles.workoutContainer}
    >
      <Text style={styles.workoutTitle}>{props.title}</Text>
      <Text style={{ color: "#ffffff7c", fontSize: 15, marginBottom: 5 }}>
        {props.description}
      </Text>

      <View style={{ flexDirection: "row", marginTop: 5 }}>
        <Tag text={`Exercises (${props.exercises.length})`} />
        <Tag text={props.difficulty} />
        <Tag text={props.type} />
      </View>
    </Ripple>
  );
}
