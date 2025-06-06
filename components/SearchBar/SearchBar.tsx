import { LayoutRectangle, StyleProp, StyleSheet, Text, TextInput, View, ViewStyle } from "react-native";
import Colors from "../../constants/Colors";
import { useEffect, useState } from "react";
import Color from "color";
import Ripple from "react-native-material-ripple";
import { AntDesign } from "@expo/vector-icons";
import Layout from "../../constants/Layout";
import { useNavigation } from "@react-navigation/core";
import { useAppSelector } from "../../utils/redux";

const backgroundColor = Color(Colors.primary).lighten(0.25).string();

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 2.5,
    borderWidth: 1.5,
    backgroundColor: backgroundColor,
    borderRadius: 100,
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  input: {
    padding: 12.5,
    fontSize: 19,
    color: Colors.secondary,
    flex: 1,
  },
  floatingContainer: {
    position: "absolute",
    backgroundColor: backgroundColor,
    borderWidth: 1,
    borderRadius: 100,
  },
  icons: {
    backgroundColor: Colors.secondary,
    padding: 5,
    borderRadius: 100,
  },
});

interface SearchBarProps<T = []> {
  outerContainerStyles?: StyleProp<ViewStyle>;

  isFocused: boolean;

  setIsFocused: React.Dispatch<React.SetStateAction<boolean>>;

  textInputRef?: React.MutableRefObject<TextInput | null>;
}

export default function SearchBar({ isFocused, setIsFocused, ...props }: SearchBarProps) {
  const [layout, setLayout] = useState<LayoutRectangle | undefined>();
  const [text, setText] = useState<string>("");
  const navigation = useNavigation<any>();
  const [suggestions, setSuggestions] = useState<typeof notes.notes>([]);

  const borderColor = isFocused ? Color(Colors.secondary).lighten(0.1).hex() : Colors.secondary;

  const onPlusPress = () => navigation.navigate("NoteCreate");

  const notes = useAppSelector((s) => s.notes);

  const handleSearchMatchingQuery = () => {
    let output = [] as typeof notes.notes;

    for (let note of notes.notes) {
      const regex = new RegExp(text, "gi");

      if (note.content.match(regex) && text !== "") {
        output.push(note);
      }
    }

    setSuggestions(output);
  };

  useEffect(() => {
    handleSearchMatchingQuery();
  }, [text]);

  return (
    <View
      style={{
        zIndex: isFocused ? 100 : 1,
        paddingTop: 7.5,
      }}
    >
      <View
        onLayout={(ev) => setLayout(ev.nativeEvent.layout)}
        style={[styles.container, { borderColor }, { zIndex: isFocused ? 100 : 1 }, props.outerContainerStyles]}
      >
        <Ripple onPress={onPlusPress} style={styles.icons}>
          <AntDesign size={24} name="plus" color={"#fff"} />
        </Ripple>
        <TextInput ref={props.textInputRef} value={text} onChangeText={setText} style={[styles.input]} onFocus={() => setIsFocused(true)} />
      </View>

      {isFocused && (
        <View
          style={[
            styles.floatingContainer,
            { borderColor },
            {
              top: layout?.height! / 2 + 7.5,
              left: layout?.x,
              width: layout?.width,
              borderRadius: 0,
              zIndex: 10,

              paddingTop: 15 + layout?.height! / 2,
              paddingBottom: 10,

              borderBottomLeftRadius: 15,
              borderBottomRightRadius: 15,

              backgroundColor: Colors.primary_lighter,
            },
          ]}
        >
          <Text style={{ color: "#ffffff74", marginBottom: 5, marginLeft: 15 }}>List of suggestions</Text>
        </View>
      )}
    </View>
  );
}
