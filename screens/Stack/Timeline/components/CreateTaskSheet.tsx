import BottomSheet from "@/components/ui/BottomSheet/BottomSheet";
import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/TextInput/TextInput";
import useKeyboard from "@/utils/hooks/useKeyboard";
import { Feather } from "@expo/vector-icons";
import BottomSheetType, { useBottomSheet } from "@gorhom/bottom-sheet";
import { forwardRef, useEffect, useState } from "react";
import { ActivityIndicator, Keyboard, Text, View } from "react-native";
import Ripple from "react-native-material-ripple";
import useTodos, {
  Action,
  TodoInput as ITodoInput,
} from "../hooks/general/useTodos";

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
      {todos.map((todo, index) => (
        <TodoInput
          key={todo.index}
          index={index}
          onAddTodo={(value) => onAddTodo(value)}
          onRemoveTodo={() => onRemoveTodo(todo)}
          length={todos.length}
        />
      ))}
    </View>
  );
};

export const TodoInput = ({
  index,
  onAddTodo,
  onRemoveTodo,
  length,
}: {
  index: number;
  onAddTodo: (value: string) => any;
  onRemoveTodo: () => any;
  length: number;
}) => {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    let timeout = setTimeout(() => {
      onAddTodo(text);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [text]);

  return (
    <Input
      autoFocus={index === 0 && length > 1}
      editable={index === 0}
      left={
        <Text
          style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: 18,
            padding: 5,
          }}
        >
          {index + 1}
        </Text>
      }
      right={({ isFocused, theme }) => (
        <Ripple
          style={{ padding: 5 }}
          onPress={() => (isFocused ? onAddTodo(text) : onRemoveTodo())}
        >
          <Feather
            size={18}
            name={isFocused ? "check" : "trash"}
            color={isFocused ? theme.colors.secondary : "#fff"}
          />
        </Ripple>
      )}
      placeholderTextColor={"gray"}
      value={text}
      onChangeText={setText}
      placeholder="Enter todo"
      onSubmitEditing={() => {
        if (text.trim().length > 0) {
          onAddTodo(text);
        } else {
          onRemoveTodo();
        }
      }}
      onEndEditing={() => {
        if (text.trim().length === 0) onRemoveTodo();
      }}
    />
  );
};
