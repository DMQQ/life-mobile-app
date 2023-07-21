import {
  FlatList,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import Colors from "../../constants/Colors";
import { useState } from "react";
import Color from "color";
import Ripple from "react-native-material-ripple";
import { AntDesign } from "@expo/vector-icons";
import Layout from "../../constants/Layout";
import { useNavigation } from "@react-navigation/core";

const backgroundColor = Color(Colors.primary).lighten(0.25).string();

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 0,
    borderWidth: 1.5,
    backgroundColor: backgroundColor,
    borderRadius: 5,
    flexDirection: "row",
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
    left: 10,
    top: 10,
    backgroundColor: backgroundColor,
    width: Layout.screen.width - 20,
    padding: 10,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderBottomEndRadius: 5,
    borderBottomStartRadius: 5,
  },
});

interface SearchBarProps<T = []> {
  outerContainerStyles?: StyleProp<ViewStyle>;

  itemList?: T[];

  renderItem?: Function;

  keyExtractor?: (item: T) => string;

  isListVisible?: boolean;

  onSubmitEditing: (text: string) => any;
}

export default function SearchBar(props: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const [text, setText] = useState<string>("");

  // prettier-ignore
  const [inputLayoutSize, setInputLayoutSize] = useState({ height: 0,width: 0,x: 0,y: 0 });

  const navigation = useNavigation();

  const borderColor = isFocused
    ? Color(Colors.secondary).lighten(0.5).hex()
    : Color(Colors.secondary).darken(0.25).string();

  const backgroundColor = Color(Colors.primary_light).darken(0.25).string();

  const onPlusPress = () => navigation.navigate<any>("NoteCreate");

  return (
    <>
      <View style={{ padding: 10 }}>
        <View
          style={[
            styles.container,
            { borderColor },
            props.outerContainerStyles,
          ]}
        >
          <Ripple
            onPress={onPlusPress}
            style={{
              backgroundColor,
              padding: 5,
              borderRadius: 100,
              marginLeft: 10,
            }}
          >
            <AntDesign size={24} name="plus" color={Colors.secondary} />
          </Ripple>
          <TextInput
            onLayout={(event) => setInputLayoutSize(event.nativeEvent.layout)}
            value={text}
            onChangeText={setText}
            style={[styles.input]}
            onBlur={() => setIsFocused(false)}
            onFocus={() => setIsFocused(true)}
            onSubmitEditing={() => props.onSubmitEditing(text)}
          />
          <Ripple
            rippleCentered
            rippleColor={Colors.secondary}
            style={{
              padding: 10,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 100,
            }}
          >
            <AntDesign name="search1" size={24} color={Colors.secondary} />
          </Ripple>
        </View>
      </View>

      {props.isListVisible && (
        <View
          style={[
            styles.floatingContainer,
            {
              transform: [
                {
                  translateY: inputLayoutSize?.height,
                },
              ],
            },
          ]}
        >
          <Text style={{ color: "#fff" }}>List of suggestions</Text>

          <FlatList
            data={props.itemList}
            keyExtractor={props.keyExtractor}
            renderItem={props.renderItem as any}
          />
        </View>
      )}
    </>
  );
}
