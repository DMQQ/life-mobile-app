import { randColor } from "@/constants/Colors";
import { useAppSelector } from "@/utils/redux";
import { Text, View } from "react-native";

const Note = (props: { marginRight: number; text: string }) => (
  <View
    style={[
      {
        backgroundColor: randColor(),
        borderRadius: 15,
        padding: 15,
        flex: 1,
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
    <Text numberOfLines={5} style={{ color: "#fff", fontSize: 18 }}>
      {props.text}
    </Text>
  </View>
);

export default function NoteWidget() {
  const { notes } = useAppSelector((st) => st.notes);

  // change to actually pinned later
  const areNotesSecure = notes.slice(0, 2).every((note) => note.secure);

  return (
    <>
      {notes.length >= 2 && !areNotesSecure && (
        <View style={{ flexDirection: "row", marginTop: 15 }}>
          <Note marginRight={15} text={notes[0].content} />
          <Note marginRight={0} text={notes[1].content} />
        </View>
      )}
    </>
  );
}
