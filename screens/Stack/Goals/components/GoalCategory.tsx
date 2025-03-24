import Colors, { secondary_candidates } from "@/constants/Colors";
import GoalActivityGrid from "./StatGrid"; // Assuming this imports the GitHubActivityGrid component
import moment from "moment";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ripple from "react-native-material-ripple";
import lowOpacity from "@/utils/functions/lowOpacity";

interface GoalCategoryProps {
  id: string;
  name: string;
  icon: string;
  description: string;
  onPress?: () => void;
  entries?: {
    id: string;
    value: number;
    date: string;
  }[];
  target: number;
  min: number;
  max: number;
  index: number;
}

export const GoalCategory = ({ name, icon, description, entries = [], onPress, ...rest }: GoalCategoryProps) => {
  const navigation = useNavigation<any>();

  const contributionData = useMemo(() => {
    return entries.map((entry) => ({
      date: entry.date,
      count: entry.value,
    }));
  }, [entries]);

  return (
    <View style={{ padding: 10, backgroundColor: Colors.primary_lighter, borderRadius: 15, marginBottom: 15 }}>
      <View style={{ pointerEvents: "box-none" }}>
        <GoalActivityGrid
          contributionData={contributionData}
          primaryColor={secondary_candidates[rest?.index % secondary_candidates.length]}
          goalThreshold={rest.target}
        />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
        <View>
          <Text style={{ color: "#fff", marginTop: 15 }}>{name}</Text>
          <Text style={{ color: "#fff" }}>{description}</Text>
        </View>

        <Ripple
          onPress={() => {
            navigation.navigate("Goal", { id: rest.id });
          }}
          style={{
            backgroundColor: lowOpacity(Colors.secondary, 0.15),
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <Text style={{ color: Colors.secondary }}>More</Text>
        </Ripple>
      </View>
    </View>
  );
};

export default GoalCategory;
