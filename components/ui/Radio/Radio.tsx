import Ripple from "react-native-material-ripple";
import { View, Text } from "react-native";
import Colors from "../../../constants/Colors";

export default function Radio(props: { onPress: Function; checked: boolean }) {
  return (
    <Ripple
      onPress={() => props.onPress()}
      style={{
        padding: 2,
        backgroundColor: Colors.secondary,
        borderRadius: 100,
        width: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 15,
          height: 15,
          borderRadius: 100,
          backgroundColor: Colors.primary_light,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {props.checked && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 100,
              backgroundColor: Colors.secondary,
            }}
          />
        )}
      </View>
    </Ripple>
  );
}

interface RadioGroupProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function RadioGroup(props: RadioGroupProps) {
  return (
    <View style={{ marginTop: 10 }}>
      {props.options.map((option) => (
        <View
          key={option.value}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 5,
          }}
        >
          <Radio
            checked={props.value === option.value}
            onPress={() => {
              props.onChange(option.value);
            }}
          />
          <Text
            style={{
              color: Colors.secondary,
              fontSize: 18,
              fontWeight: "bold",
              marginLeft: 10,
            }}
          >
            {option.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
