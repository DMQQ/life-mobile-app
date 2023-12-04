import { View, Text, Pressable, StyleSheet, ToastAndroid } from "react-native";
import { Timeline, Todos } from "../../../../types";
import Colors from "../../../../constants/Colors";
import Color from "color";
import Ripple from "react-native-material-ripple";
import useUser from "../../../../utils/hooks/useUser";
import { gql, useMutation } from "@apollo/client";
import { GET_TIMELINE } from "../hooks/query/useGetTimelineById";
import Button from "../../../../components/ui/Button/Button";
import React from "react";
import Input from "../../../../components/ui/TextInput/TextInput";
import CompleteTodoButton from "./CompleteTodoButton";

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
    backgroundColor: Color(Colors.primary).lighten(0.5).string(),
    padding: 15,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
});

const useCreateTodo = (timelineId: string) => {
  const usr = useUser();

  const [createTodo, state] = useMutation(
    gql`
      mutation CreateTodo($title: String!, $timelineId: ID!) {
        createTimelineTodos(todos: { title: $title, timelineId: $timelineId }) {
          id
          title
          isCompleted
        }
      }
    `,
    {
      update(cache, data) {
        const timeline = cache.readQuery({
          query: GET_TIMELINE,
          variables: { id: timelineId },
        }) as { timelineById: Timeline };

        const final = {
          timelineById: {
            ...timeline.timelineById,
            todos: [
              ...timeline.timelineById.todos,
              data.data.createTimelineTodos,
            ],
          },
        };

        cache.writeQuery({
          data: final,
          id: cache.identify(final),
          query: GET_TIMELINE,
          variables: { id: timeline.timelineById.id },
        });
      },
      context: {
        headers: {
          authentication: usr.token,
        },
      },
    }
  );

  return { createTodo, state };
};

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

  return (
    <View style={{ marginTop: 20 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Todos ({props.todos.length})</Text>

        <Ripple onPress={() => setShow((s) => !s)} style={styles.createTodo}>
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
            onPress={handleCreateTodo}
            fontStyle={styles.buttonText}
            style={styles.button}
          >
            Add todo
          </Button>
        </View>
      )}
    </View>
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

const Todo = (todo: Todos & { timelineId: string }) => {
  const usr = useUser();

  const [removeTodo] = useMutation(
    gql`
      mutation RemoveTodo($id: ID!) {
        removeTimelineTodo(id: $id)
      }
    `,
    {
      context: {
        headers: {
          token: usr.token,
        },
      },
      update(cache) {
        const todos = cache.readQuery({
          query: GET_TIMELINE,
          variables: { id: todo.timelineId },
        }) as { timelineById: Timeline };

        const final = {
          timelineById: {
            ...todos.timelineById,
            todos: todos.timelineById.todos.filter(
              (t: Todos) => t.id !== todo.id
            ),
          },
        };

        cache.writeQuery({
          overwrite: true,
          query: GET_TIMELINE,
          variables: { id: todo.timelineId },
          data: final,
          id: cache.identify(final),
        });
      },
      onCompleted() {
        ToastAndroid.show("Todo removed", ToastAndroid.SHORT);
      },
      variables: {
        id: todo.id,
      },
    }
  );

  return (
    <Animated.View
      layout={Layout.delay(100)}
      entering={FadeInDown}
      exiting={FadeOutUp}
    >
      <Pressable onLongPress={() => removeTodo()} style={styles.todo}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Dot color={todo.isCompleted ? Colors.secondary : "red"} />

          <Text style={{ color: "#fff", marginLeft: 15 }}>{todo.title}</Text>
        </View>

        <CompleteTodoButton timelineId={todo.timelineId} todoId={todo.id} />
      </Pressable>
    </Animated.View>
  );
};
