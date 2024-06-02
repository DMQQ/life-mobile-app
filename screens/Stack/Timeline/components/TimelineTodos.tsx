import { View, Text, Pressable, StyleSheet } from "react-native";
import { Todos } from "../../../../types";
import Colors from "../../../../constants/Colors";
import Color from "color";
import Ripple from "react-native-material-ripple";
import Button from "../../../../components/ui/Button/Button";
import React, { useState } from "react";
import Input from "../../../../components/ui/TextInput/TextInput";
import CompleteTodoButton from "./CompleteTodoButton";

import L from "@/constants/Layout";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    color: Colors.secondary,
    fontWeight: "bold",
  },
  createTodo: {
    backgroundColor: Colors.secondary,
    borderRadius: 100,
    padding: 5,
    paddingHorizontal: 10,
    flexDirection: "row",
  },
  button: {
    backgroundColor: Color(Colors.secondary).alpha(0.15).string(),
    paddingVertical: 15,
  },
  buttonText: {
    color: Colors.secondary,
    fontSize: 15,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 100,
  },
  todo: {
    backgroundColor: Colors.primary_lighter,
    padding: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
});

export default function TimelineTodos(props: {
  todos: Todos[];
  timelineId: string;
}) {
  const { createTodo } = useCreateTodo(props.timelineId);

  const [text, setText] = React.useState("");

  const handleCreateTodo = async () => {
    if (text.trim() === "") return;
    await createTodo({
      variables: {
        title: text,
        timelineId: props.timelineId,
      },
    });

    setShow(false);
    setText("");
  };

  const [show, setShow] = React.useState(false);

  const [dialog, setDialog] = useState(false);
  const [dialogText, setDialogText] = useState("");

  const handleTransfer = useTransferTodos(props.todos, dialogText);

  return (
    <>
      <View style={{ marginTop: 25 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Todos ({props.todos.length})</Text>

          <Ripple
            onLongPress={() => setDialog((p) => !p)}
            onPress={() => setShow((s) => !s)}
            style={styles.createTodo}
          >
            <Text style={{ fontWeight: "bold", color: Colors.primary }}>
              Create todo
            </Text>
          </Ripple>
        </View>

        {props.todos.map((todo) => (
          <Todo timelineId={props.timelineId} key={todo.id} {...todo} />
        ))}

        {show && (
          <View style={{ marginTop: 15 }}>
            <Input
              autoFocus
              value={text}
              setValue={setText}
              placeholder="todo's name"
              placeholderTextColor={"gray"}
              onSubmitEditing={handleCreateTodo}
            />

            <Button
              disabled={text.trim().length === 0}
              onPress={handleCreateTodo}
              fontStyle={styles.buttonText}
              type="outlined"
              style={{ borderRadius: 10 }}
            >
              Create task
            </Button>
          </View>
        )}
      </View>

      <Overlay
        opacity={0.8}
        onClose={() => setDialog(false)}
        isVisible={dialog}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              padding: 20,
              backgroundColor: Colors.primary,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                color: Colors.secondary,
                marginBottom: 10,
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              New event ID
            </Text>
            <Input
              label="Event id to be copied"
              placeholder="xxxx-xxxxx-xxxxx"
              placeholderTextColor="gray"
              value={dialogText}
              setValue={setDialogText}
              style={{ width: L.screen.width - 50 }}
            />
            <Button
              style={{ marginTop: 10 }}
              type="outlined"
              onPress={handleTransfer}
            >
              Copy
            </Button>
          </View>
        </View>
      </Overlay>
    </>
  );
}

const Dot = (props: { color: string }) => (
  <View style={[styles.dot, { backgroundColor: props.color }]} />
);

import Animated, {
  FadeInDown,
  FadeOutUp,
  Layout,
} from "react-native-reanimated";
import Overlay from "@/components/ui/Overlay/Overlay";
import useCreateTodo from "../hooks/mutation/useCreateTodo";
import useTransferTodos from "../hooks/mutation/useTransferTodos";
import useRemoveTodo from "../hooks/mutation/useRemoveTodo";

const Todo = (todo: Todos & { timelineId: string }) => {
  const removeTodo = useRemoveTodo(todo);

  return (
    <Animated.View
      layout={Layout.delay(100)}
      entering={FadeInDown}
      exiting={FadeOutUp}
    >
      <Pressable onLongPress={() => removeTodo()} style={styles.todo}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Dot color={todo.isCompleted ? Colors.secondary : "red"} />

          <Text style={{ color: "#fff", marginLeft: 15, fontSize: 16 }}>
            {todo.title}
          </Text>
        </View>

        {!todo.isCompleted && (
          <CompleteTodoButton timelineId={todo.timelineId} todoId={todo.id} />
        )}
      </Pressable>
    </Animated.View>
  );
};
