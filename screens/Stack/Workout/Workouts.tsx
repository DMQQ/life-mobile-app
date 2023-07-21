import {
  View,
  StyleSheet,
  Text,
  Image,
  Pressable,
  FlatList,
} from "react-native";
import ScreenContainer from "../../../components/ui/ScreenContainer";
import { gql, useQuery } from "@apollo/client";
import useUser from "../../../utils/hooks/useUser";
import Color from "color";
import Colors from "../../../constants/Colors";
import { Workout } from "../../../types";
import Ripple from "react-native-material-ripple";
import { WorkoutScreenProps } from "./types";
import Button from "../../../components/ui/Button/Button";

const GetWorkoutsQuery = gql`
  query GetWorkouts {
    workouts {
      workoutId
      title
      description
      type
      difficulty

      exercises {
        exerciseId
      }
    }
  }
`;

function useGetWorkoutsQuery() {
  const usr = useUser();

  return useQuery(GetWorkoutsQuery, {
    context: {
      headers: {
        token: usr.token,
      },
    },
  });
}

const bgColor = Color(Colors.primary).lighten(0.25).string();

const Tag = (props: { text: string }) => (
  <Text
    style={{
      backgroundColor: Color(Colors.secondary).alpha(0.75).string(),
      paddingHorizontal: 5,
      padding: 2.5,
      borderRadius: 5,
      marginRight: 5,
    }}
  >
    {props.text}
  </Text>
);

function WorkoutTile(props: Workout & { navigation: any }) {
  return (
    <Ripple
      onPress={() =>
        props.navigation.navigate("Workout", {
          workoutId: props.workoutId,
        })
      }
      rippleColor={Colors.secondary}
      style={{
        backgroundColor: bgColor,
        padding: 5,
        borderRadius: 5,
        marginBottom: 10,
      }}
    >
      <Text
        style={{ fontWeight: "bold", fontSize: 18, color: Colors.secondary }}
      >
        {props.title}
      </Text>
      <Text style={{ color: "#ffffff7c", fontSize: 15 }}>
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

export default function Workouts({
  navigation,
}: WorkoutScreenProps<"Workouts">) {
  const query = useGetWorkoutsQuery();

  return (
    <ScreenContainer>
      <FlatList
        ListFooterComponentStyle={{
          marginTop: 20,
        }}
        ListFooterComponent={
          <Button
            onPress={() => navigation.navigate("WorkoutCreate")}
            fontStyle={{ textTransform: "none" }}
            variant="ternary"
            type="contained"
          >
            Create new workout
          </Button>
        }
        data={query.data?.workouts}
        keyExtractor={(item) => item.workoutId}
        renderItem={({ item }) => (
          <WorkoutTile navigation={navigation} key={item.workoutId} {...item} />
        )}
      />
    </ScreenContainer>
  );
}
