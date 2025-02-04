import ScreenContainer from "@/components/ui/ScreenContainer";
import { useGoal } from "../hooks/hooks";
import Button from "@/components/ui/Button/Button";
import { FlatList } from "react-native";
import { GoalCategory } from "../components/GoalCategory";

export default function Goals({ navigation }) {
  const { goal, goals } = useGoal();

  return (
    <ScreenContainer>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GoalCategory
            onPress={() => {
              navigation.navigate("Goal", { id: item.id });
            }}
            {...item}
          />
        )}
      />
      <Button onPress={() => navigation.navigate("CreateGoal")}>Create Goal</Button>
    </ScreenContainer>
  );
}
