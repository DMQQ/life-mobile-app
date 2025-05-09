import { Text } from "react-native";
import Ripple from "react-native-material-ripple";
import Colors from "@/constants/Colors";
import useCompleteTodo from "../hooks/mutation/useCompleteTodo";

export default function CompleteTodoButton(props: { todoId: string; timelineId: string }) {
  const { completeTodo } = useCompleteTodo(props);

  return (
    <Ripple onPress={() => completeTodo()}>
      <Text style={{ color: Colors.secondary, marginLeft: 25, fontSize: 13 }}>Complete</Text>
    </Ripple>
  );
}
