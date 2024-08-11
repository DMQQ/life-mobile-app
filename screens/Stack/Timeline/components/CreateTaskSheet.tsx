import BottomSheet from "@/components/ui/BottomSheet/BottomSheet";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/TextInput/TextInput";
import useKeyboard from "@/utils/hooks/useKeyboard";
import Colors from "@/constants/Colors";
import BottomSheetType, { useBottomSheet } from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Keyboard, Text, View } from "react-native";
import Ripple from "react-native-material-ripple";
import useTodos, {
  Action,
  TodoInput as ITodoInput,
} from "../hooks/general/useTodos";
import { AntDesign } from "@expo/vector-icons";
import Color from "color";

export default forwardRef<
  BottomSheetType,
  {
    timelineId: string;
  }
>(({ timelineId }, ref) => {
  const { dispatch, loading, onSaveTodos, state } = useTodos(timelineId, () => {
    Keyboard.dismiss();
    (ref as any).current?.close();
  });

  return (
    <BottomSheet ref={ref} snapPoints={["50%", "80%"]}>
      <View style={{ paddingHorizontal: 15 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 20, color: "#fff", fontWeight: "bold" }}>
            Create Todo's
          </Text>

          <Ripple
            onPress={() => dispatch({ type: "clear", payload: undefined })}
          >
            <Text style={{ color: "#fff", fontSize: 16 }}>Remove</Text>
          </Ripple>
        </View>

        <TodosList dispatch={dispatch} todos={state.todos} />

        <Button
          disabled={loading || state?.todos?.[0]?.value?.trim()?.length === 0}
          onPress={onSaveTodos}
          style={{ flexDirection: "row-reverse" }}
          fontStyle={{ fontSize: 16 }}
          icon={
            loading && (
              <ActivityIndicator
                style={{ marginHorizontal: 10 }}
                color="#fff"
                size="small"
              />
            )
          }
        >
          Save todos
        </Button>
      </View>
    </BottomSheet>
  );
});

const TodosList = ({
  todos,
  dispatch,
}: {
  todos: ITodoInput[];
  dispatch: React.Dispatch<Action>;
}) => {
  const { snapToIndex } = useBottomSheet();

  const isExpanded = useKeyboard();

  const onAddTodo = (value: string) => {
    dispatch({ type: "add", payload: value });
  };

  const onRemoveTodo = (todo: ITodoInput) => {
    dispatch({ type: "remove", payload: todo.index });
  };

  useEffect(() => {
    isExpanded ? snapToIndex(1) : snapToIndex(0);
  }, [isExpanded]);

  return (
    <View style={{ marginTop: 15 }}>
      <TodoInput onAddTodo={onAddTodo} />
      <View style={{ marginVertical: 10 }}>
        {todos.map((todo, index) => (
          <Todo
            key={todo.index}
            {...todo}
            onRemove={() => onRemoveTodo(todo)}
          />
        ))}
      </View>
    </View>
  );
};

const Todo = (
  todo: ITodoInput & {
    onRemove: () => any;
  }
) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      backgroundColor: Colors.primary_light,
      padding: 10,
      borderWidth: 1,
      borderColor: Color(Colors.primary_lighter).lighten(0.5).hex(),
      justifyContent: "space-between",
      borderRadius: 10,
    }}
  >
    <Text style={{ color: "#fff", fontSize: 16, marginLeft: 10 }}>
      {todo.value}
    </Text>

    <Ripple onPress={todo.onRemove}>
      <AntDesign name="close" size={20} color={Colors.error} />
    </Ripple>
  </View>
);

export const TodoInput = ({
  onAddTodo,
}: {
  onAddTodo: (value: string) => any;
}) => {
  const [text, setText] = useState<string>("");

  const ref = useRef<any>();

  const onSubmit = () => {
    if (text.trim().length > 0) {
      onAddTodo(text);
      setText("");
    }
  };

  useEffect(() => {
    let timeout = setTimeout(() => {
      ref.current.focus();
    }, 1);

    return () => clearTimeout(timeout);
  });

  return (
    <Input
      inputRef={ref}
      style={{ margin: 0 }}
      right={
        <Ripple onPress={onSubmit}>
          <AntDesign name="plus" size={20} color="gray" />
        </Ripple>
      }
      autoFocus
      placeholderTextColor={"gray"}
      value={text}
      onChangeText={setText}
      placeholder="Enter todo"
      onSubmitEditing={onSubmit}
      onEndEditing={onSubmit}
    />
  );
};
