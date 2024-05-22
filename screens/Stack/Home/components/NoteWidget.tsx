import Colors, { randColor } from "@/constants/Colors";
import Layout from "@/constants/Layout";
import { useAppSelector } from "@/utils/redux";
import Color from "color";
import { FlatList, Text, View } from "react-native";

const backgroundColor = Colors.primary_lighter;

const Note = (props: { marginRight: number; text: string }) => (
  <View
    style={[
      {
        backgroundColor: "#ffffff15",
        borderRadius: 25,
        padding: 15,
        flex: 1,
        width: Layout.screen.width * 0.7,
      },
      { marginRight: props.marginRight },
    ]}
  >
    <Text
      numberOfLines={5}
      style={{
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 5,
      }}
    >
      Pinned note
    </Text>
    <Text
      numberOfLines={5}
      style={{
        color: "rgba(255,255,255,0.9)",
        fontSize: 18,
        width: "100%",
      }}
    >
      {props.text}
    </Text>
  </View>
);

export default function NoteWidget() {
  const { notes } = useAppSelector((st) => st.notes);

  const data = notes.slice(0, 5).filter((note) => !note.secure);

  if (data.length === 0) return null;

  return (
    <View
      style={{
        backgroundColor,
        padding: 15,
        borderRadius: 25,
        marginTop: 15,
      }}
    >
      <FlatList
        horizontal
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <Note
            marginRight={index === notes.length - 1 ? 0 : 10}
            text={item.content}
          />
        )}
      />
    </View>
  );
}
