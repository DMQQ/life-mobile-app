import { View, Text, FlatList, TextInput } from "react-native";
import ScreenContainer from "../../../components/ui/ScreenContainer";
import { gql, useQuery } from "@apollo/client";
import useUser from "../../../utils/hooks/useUser";
import Color from "color";
import Colors from "../../../constants/Colors";
import { Workout } from "../../../types";
import Ripple from "react-native-material-ripple";
import { WorkoutScreenProps } from "./types";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import Animated, {
  Layout,
  SlideInRight,
  SlideOutRight,
} from "react-native-reanimated";

import L from "../../../constants/Layout";
import { useAppSelector } from "../../../utils/redux";
import { useNavigation } from "@react-navigation/native";

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

const SearchTab = (props: { onPress: Function }) => {
  const { title, isWorkoutPending, workoutId, currentExercise } =
    useAppSelector((s) => s.workout);

  const navigation = useNavigation<any>();

  return (
    <View
      style={{
        width: "100%",
        height: 70,
        padding: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View>
        {isWorkoutPending && (
          <Ripple
            onPress={() =>
              navigation.navigate("PendingWorkout", {
                workoutId,
                delayTimerStart: 0,
                exerciseId: currentExercise.exerciseId,
              })
            }
            style={{
              padding: 10,
              backgroundColor: "#00BB69",
              borderRadius: 100,
              paddingHorizontal: 15,
            }}
          >
            <Text style={{ color: Colors.text_light }}>
              Active workout ({title})
            </Text>
          </Ripple>
        )}
      </View>

      <Ripple style={{ padding: 10 }} onPress={() => props.onPress()}>
        <Ionicons name="options" size={24} color={Colors.secondary} />
      </Ripple>
    </View>
  );
};

const IconButton = (props: {
  color: string;
  onPress: Function;
  icon: string;
  delay?: number;
}) => (
  <Animated.View
    entering={SlideInRight.delay(props.delay || 0)
      .springify()
      .duration(100)}
    exiting={SlideOutRight.delay(props.delay || 0)
      .springify()
      .duration(100)}
  >
    <Ripple
      onPress={() => props.onPress()}
      style={{
        padding: 15,
        borderRadius: 100,
        backgroundColor: props.color || Colors.secondary,
        marginBottom: 15,
      }}
    >
      <Ionicons color={"#fff"} size={30} name={props.icon as any} />
    </Ripple>
  </Animated.View>
);

export default function Workouts({
  navigation,
}: WorkoutScreenProps<"Workouts">) {
  const query = useGetWorkoutsQuery();

  const [isVisible, setIsVisible] = useState(false);

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <SearchTab onPress={() => setIsVisible((p) => !p)} />
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 10 }}
        ListFooterComponentStyle={{
          marginTop: 20,
        }}
        data={query.data?.workouts}
        keyExtractor={(item) => item.workoutId}
        renderItem={({ item }) => (
          <WorkoutTile navigation={navigation} key={item.workoutId} {...item} />
        )}
      />

      {isVisible && (
        <View
          style={{
            position: "absolute",
            width: L.screen.width,
            height: L.screen.height,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <Animated.View
            layout={Layout}
            style={{
              zIndex: 100,
              position: "absolute",
              right: 15,
              bottom: 120,
            }}
          >
            <IconButton
              icon="create"
              onPress={() => navigation.navigate("WorkoutCreate")}
              color={Colors.secondary}
              delay={isVisible ? 100 : 300}
            />
            <IconButton
              icon="search"
              onPress={() => {}}
              color={Color(Colors.secondary).darken(0.2).string()}
              delay={200}
            />
            <IconButton
              icon="options"
              onPress={() => {}}
              color={Color(Colors.secondary).darken(0.4).string()}
              delay={isVisible ? 300 : 100}
            />
            <IconButton
              icon="close"
              onPress={() => setIsVisible(false)}
              color={Color(Colors.secondary).darken(0.6).string()}
              delay={isVisible ? 400 : 100}
            />
          </Animated.View>
        </View>
      )}
    </ScreenContainer>
  );
}
