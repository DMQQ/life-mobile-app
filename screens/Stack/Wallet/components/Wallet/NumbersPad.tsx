import Button from "@/components/ui/Button/Button";
import { useState } from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";
import Colors from "@/constants/Colors";
import { AntDesign } from "@expo/vector-icons";
import Layout from "@/constants/Layout";
import Feedback from "react-native-haptic-feedback";

const buttonStyle = {
  width: (Layout.window.width - 60) / 3 - 10,
  height: (Layout.window.width - 120) / 3 - 10,
  borderRadius: 100,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "transparent",
} as StyleProp<ViewStyle>;

export default function NumbersPad() {
  const [value, setValue] = useState("0");

  const pipe = (...fns: Function[]) => {
    return (...args: any[]) => {
      fns.forEach((fn) => fn(...args));
    };
  };

  const haptic = () => {
    Feedback.trigger("impactLight");
  };

  return (
    <View style={{ padding: 15, flex: 1 }}>
      <View style={{ justifyContent: "center", padding: 20, marginBottom: 20 }}>
        <Text
          style={{
            color: "#fff",
            fontSize: 60,
            fontWeight: "bold",
            textAlign: "center",
            backgroundColor: Colors.primary_light,
            borderRadius: 10,
          }}
        >
          {value}
        </Text>
      </View>

      <View
        style={{
          gap: 10,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => (
          <Button onPress={pipe(haptic, () => setValue(value + v))} key={v} style={buttonStyle} fontStyle={{ fontSize: 24 }}>
            {v}
          </Button>
        ))}
        <Button onPress={pipe(haptic, () => setValue((prev) => prev.slice(0, -1)))} style={buttonStyle} fontStyle={{ fontSize: 24 }}>
          <AntDesign name="back" size={24} color="#fff" />
        </Button>

        <Button onPress={pipe(haptic, () => setValue(value + 0))} style={buttonStyle} fontStyle={{ fontSize: 24 }}>
          0
        </Button>

        <Button style={buttonStyle} fontStyle={{ fontSize: 24 }}>
          <AntDesign name="save" size={24} color={"#fff"} />
        </Button>
      </View>
    </View>
  );
}
