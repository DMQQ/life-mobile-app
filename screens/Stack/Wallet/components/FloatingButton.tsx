import { Ionicons } from "@expo/vector-icons";
import Ripple from "react-native-material-ripple";

export default function FloatingButton(props: { onPress: () => void }) {
  return (
    <Ripple
      onPress={props.onPress}
      style={{
        position: "absolute",
        right: 15,
        bottom: 20,
        padding: 12.5,
        borderRadius: 100,
        backgroundColor: "#00BB69",

        zIndex: 250,

        shadowColor: "#000",

        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }}
    >
      <Ionicons color={"#fff"} size={30} name={"add"} />
    </Ripple>
  );
}
