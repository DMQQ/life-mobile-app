import { FlatList, Text, View } from "react-native";
import Colors from "@/constants/Colors";
import { ScreenProps } from "../../../../types";
import Header from "@/components/ui/Header/Header";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Ripple from "react-native-material-ripple";

import { Group, useFlashCards, useGroups, useGroupStats } from "../hooks";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeIn } from "react-native-reanimated";

export default function NotesScreen({ navigation }: ScreenProps<any>) {
  const { groups } = useGroups();

  return (
    <>
      <SafeAreaView style={{ padding: 0 }}>
        <Header
          title="FlashCards"
          buttons={[
            {
              icon: <AntDesign name="plus" size={20} color={"#fff"} />,
              onPress: () => navigation.navigate("CreateFlashCardGroup"),
            },
          ]}
          titleAnimatedStyle={{}}
        />
        <FlatList
          style={{ paddingHorizontal: 15 }}
          data={groups}
          keyExtractor={(key) => key.id.toString()}
          renderItem={({ item: group, index }) => <FlashCardGroup {...group} index={index} length={groups.length} />}
        />
      </SafeAreaView>
    </>
  );
}

const successRate = (num: number) => {
  if (num === 0) return "red";

  if (num < 50) return "orange";

  if (num < 70) return "yellow";

  if (num < 90) return "green";

  return Colors.secondary;
};

const FlashCardGroup = (group: Group & { index: number; length: number }) => {
  const navigation = useNavigation<any>();

  const { data } = useGroupStats(group.id);

  const groupStats = data?.groupStats;

  return (
    <Ripple onPress={() => navigation.navigate("FlashCard", { groupId: group.id })} onLongPress={() => {}}>
      <View
        style={{
          backgroundColor: Colors.primary_lighter,
          padding: 20,
          borderRadius: 15,
          marginVertical: 7.5,
          gap: 10,
          minHeight: 150,

          ...(group.index === group.length - 1 && { marginBottom: 40 }),
        }}
      >
        <Text style={{ color: Colors.secondary, fontSize: 20, fontWeight: "bold" }}>{group.name}</Text>
        <Text style={{ color: "#fff", fontSize: 15 }}>{group.description}</Text>

        {groupStats && (
          <Animated.View entering={FadeIn} style={{ gap: 15 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>{moment(group.createdAt).format("MMM Do YYYY")}</Text>

              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>{groupStats?.masteredCards} Mastered</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>{groupStats?.totalCards} Cards</Text>
              <Text style={{ color: successRate(groupStats?.averageSuccessRate || 0), fontSize: 12 }}>
                {groupStats?.averageSuccessRate.toFixed(2)}% Success Rate
              </Text>
            </View>
          </Animated.View>
        )}
      </View>
    </Ripple>
  );
};
