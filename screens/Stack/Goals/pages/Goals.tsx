import ScreenContainer from "@/components/ui/ScreenContainer";
import { useGoal } from "../hooks/hooks";
import { FlatList } from "react-native";
import { GoalCategory } from "../components/GoalCategory";
import Header from "@/components/ui/Header/Header";
import { AntDesign } from "@expo/vector-icons";

export default function Goals({ navigation }: any) {
  const { goals } = useGoal();

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <Header
        buttons={[
          {
            onPress: () => navigation.navigate("CreateGoal"),
            icon: <AntDesign name="plus" size={20} color="#fff" />,
          },
        ]}
      />
      <FlatList
        contentContainerStyle={{ padding: 15 }}
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
    </ScreenContainer>
  );
}
