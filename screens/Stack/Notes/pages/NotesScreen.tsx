import { FlatList, Text, View } from "react-native";
import Colors from "@/constants/Colors";
import Note from "../components/Note";
import { ScreenProps } from "../../../../types";
import { useAppSelector } from "../../../../utils/redux";
import Header from "@/components/ui/Header/Header";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Ripple from "react-native-material-ripple";
import Button from "@/components/ui/Button/Button";
import lowOpacity from "@/utils/functions/lowOpacity";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Group, useFlashCards, useGroups, useGroupStats } from "../hooks";
import { useState } from "react";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";

export default function NotesScreen({ navigation }: ScreenProps<any>) {
  const notes = useAppSelector((a) => a.notes);

  const { groups } = useGroups();

  const [view, setView] = useState<"notes" | "flashcards">("flashcards");

  return (
    <>
      <SafeAreaView style={{ padding: 0 }}>
        <Header
          buttons={[
            {
              icon: <AntDesign name={view === "flashcards" ? "book" : "filetext1"} size={20} color={"#fff"} />,
              onPress: () => setView((p) => (p === "flashcards" ? "notes" : "flashcards")),
            },
            {
              icon: <AntDesign name="plus" size={20} color={"#fff"} />,
              onPress: () => navigation.navigate("NoteCreate"),
            },
          ]}
          titleAnimatedStyle={{}}
        />

        {view === "flashcards" ? (
          <FlatList
            ListHeaderComponent={
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 }}>
                <Text style={{ fontSize: 30, color: "#fff", fontWeight: "bold", marginBottom: 10 }}>Flashcards</Text>

                <Button
                  fontStyle={{ color: Colors.secondary, fontSize: 12.5 }}
                  onPress={() => navigation.navigate("CreateFlashCardGroup")}
                  style={{ backgroundColor: lowOpacity(Colors.secondary, 0.15), padding: 10 }}
                >
                  Create Flashcards
                </Button>
              </View>
            }
            style={{ padding: 15 }}
            data={groups}
            keyExtractor={(key) => key.id.toString()}
            renderItem={({ item: group, index }) => <FlashCardGroup {...group} index={index} length={groups.length} />}
          />
        ) : (
          <FlatList
            ListHeaderComponent={<Text style={{ fontSize: 30, color: "#fff", fontWeight: "bold", padding: 5 }}>Notes</Text>}
            style={{ padding: 15 }}
            data={notes.notes}
            keyExtractor={(i) => i.id.toString()}
            renderItem={({ item: n }) => (
              <Note noteId={n.id.toString()} tasks={[]} title={n.content.split("\n")[0]} text={n.content} {...n} />
            )}
          />
        )}
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

          ...(group.index === group.length - 1 && { marginBottom: 40 }),
        }}
      >
        <Text style={{ color: Colors.secondary, fontSize: 20, fontWeight: "bold" }}>{group.name}</Text>
        <Text style={{ color: "#fff", fontSize: 15 }}>{group.description}</Text>

        {groupStats && (
          <>
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
          </>
        )}
      </View>
    </Ripple>
  );
};
