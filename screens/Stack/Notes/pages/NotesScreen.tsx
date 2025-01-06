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
import { useFlashCards, useGroups } from "../hooks";
import { useState } from "react";

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
            renderItem={({ item: group }) => (
              <Ripple onPress={() => navigation.navigate("FlashCard", { groupId: group.id })} onLongPress={() => {}}>
                <View
                  style={{
                    backgroundColor: Colors.primary_lighter,
                    padding: 20,
                    borderRadius: 15,
                    marginVertical: 5,
                    gap: 10,
                  }}
                >
                  <Text style={{ color: Colors.secondary, fontSize: 20, fontWeight: "bold" }}>{group.name}</Text>
                  <Text style={{ color: Colors.secondary, fontSize: 15 }}>
                    {group.description} - {group.createdAt}
                  </Text>
                </View>
              </Ripple>
            )}
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
