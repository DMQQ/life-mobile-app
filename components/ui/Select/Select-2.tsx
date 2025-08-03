import { ReactNode, useState } from "react";
import {
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ripple from "react-native-material-ripple";
import Colors from "@/constants/Colors";
import Animated from "react-native-reanimated";

interface SelectProps<T> {
  options: T[];
  selected: T[] | T;
  setSelected: (selected: T[] | T) => void;
  placeholderText: string;
  transparentOverlay?: boolean;
  closeOnSelect?: boolean;

  onClose: () => void;
  onFocusChange?: (focused: boolean) => void;
  multiSelect?: boolean;
  renderCustomSelected?: () => ReactNode;

  renderItem?: (props: { item: T; index: number }) => ListRenderItem<T>;
}

const PressableOverlay = ({
  onPress,
  isTransparent,
}: {
  onPress: () => void;
  isTransparent?: boolean;
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: isTransparent ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)",
        },
      ]}
    />
  );
};

export default function Select<T>(props: SelectProps<T>) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <>
      {isFocused && (
        <PressableOverlay
          isTransparent={props.transparentOverlay || false}
          onPress={props.onClose}
        />
      )}

      <Ripple
        onPress={() => {
          setIsFocused((prev) => !prev);
          props.onFocusChange?.(!isFocused);
        }}
      >
        <View
          style={{
            backgroundColor: isFocused
              ? Colors.primary_lighter
              : Colors.primary_light,
            borderRadius: 10,
            padding: 17.5,
            flexDirection: "row",
            width: "100%", //(style as any)?.width ?? Layout.screen.width * 0.95,
            borderWidth: 2,
            borderColor: false
              ? Colors.error
              : isFocused
              ? Colors.secondary
              : Colors.primary_light,
            alignItems: "center",
          }}
        >
          {props.renderCustomSelected ? (
            props.renderCustomSelected()
          ) : (
            <Text style={styles.placeholder}>Select value</Text>
          )}
        </View>
      </Ripple>

      {isFocused && (
        <Animated.FlatList
          data={props.options}
          renderItem={({ item, index }) => props.renderItem({ item, index })}
          keyExtractor={(item, index) => index.toString()}
          style={{
            backgroundColor: Colors.primary_lighter,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: Colors.secondary,
            position: "absolute",
            width: "100%",
            top: "90%",
            maxHeight: 250,
            zIndex: 150,
            left: 15,
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#000",
    width: "100%",
  },

  placeholder: {
    color: Colors.foreground,
    fontSize: 16,
  },
});
