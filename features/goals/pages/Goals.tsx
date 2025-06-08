import { useGoal } from "../hooks/hooks";
import { FlatList, View } from "react-native";
import { GoalCategory } from "../components/GoalCategory";
import Header from "@/components/ui/Header/Header";
import { AntDesign } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Goals({ navigation }: any) {
  const { goals } = useGoal();

  const insets = useSafeAreaInsets();

  return (
    <View style={{ padding: 0, flex: 1, marginTop: insets.top, paddingBottom: 70 }}>
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
        renderItem={({ item, index }) => (
          <GoalCategory
            index={index}
            onPress={() => {
              navigation.navigate("Goal", { id: item.id });
            }}
            {...item}
          />
        )}
      />
    </View>
  );
}
