import { gql, useQuery } from "@apollo/client";
import Select from "../ui/Select/Select";
import useUser from "../../utils/hooks/useUser";
import { useState, useCallback, useEffect } from "react";

import { View, Text, Image } from "react-native";
import { Exercise } from "../../types";
import Ripple from "react-native-material-ripple";
import Colors from "../../constants/Colors";
import Color from "color";
import { AntDesign } from "@expo/vector-icons";

const GET_EXERCISES = gql`
  query GetExercises {
    exercises {
      exerciseId
      title
      description
      difficulty
      muscleGroup
      equipment
      image
    }
  }
`;

const useGetExercises = () => {
  return useQuery(GET_EXERCISES);
};

interface Props {
  setSelected: (selected: string[]) => void;
}

export default function ExercisesSelect({
  setSelected: setSelectedIds,
}: Props) {
  const { data } = useGetExercises();

  const [selected, setSelected] = useState<Exercise[]>([]);

  const handleSelected = (item: Exercise) => {
    if (selected.find((i) => i.exerciseId === item.exerciseId)) {
      setSelected(selected.filter((i) => i.exerciseId !== item.exerciseId));
    } else {
      setSelected([...selected, item]);
    }
  };

  useEffect(() => {
    setSelectedIds(selected.map((i) => i.exerciseId));
  }, [selected]);

  const renderItem = useCallback(
    ({ item, index }: { item: Exercise; index: number }) => {
      const find = selected.find((i) => i.exerciseId === item.exerciseId);
      return (
        <Ripple
          onPress={() => handleSelected(item)}
          rippleCentered
          rippleColor={Colors.secondary}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
            paddingHorizontal: 15,
            backgroundColor: find ? Colors.primary : "transparent",
          }}
        >
          <View>
            <Text style={{ color: Colors.foreground, fontSize: 20 }}>{item.title}</Text>
            <Text
              style={{ color: "#ffffff84", fontSize: 15 }}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          </View>
        </Ripple>
      ) as any;
    },
    [selected]
  );

  return (
    <Select
      anchor="top"
      renderCustomSelected={
        <View
          style={{
            flexWrap: "wrap",
            flexDirection: "row",
            padding: 5,
          }}
        >
          {selected.map((element) => (
            <View
              key={element.exerciseId}
              style={{
                paddingHorizontal: 15,
                paddingVertical: 5,
                borderRadius: 100,
                backgroundColor: Colors.secondary,
                margin: 5,
              }}
            >
              <Text style={{ color: "#000" }}>{element.title}</Text>
            </View>
          ))}
          {selected.length === 0 && (
            <Text
              style={{
                color: "gray",
                fontSize: 18,
                padding: 15,
              }}
            >
              Expand list to select exercise
            </Text>
          )}
        </View>
      }
      options={data?.exercises as Exercise[]}
      selected={selected.map((i) => i.title).reverse()}
      multiSelect
      setSelected={setSelected as any}
      renderDefaultItem={false}
      singleTileHeight={75}
      keyExtractor={(item: Exercise) => item.exerciseId}
      renderItem={renderItem}
      maxSelectHeight={75 * 4}
      placeholderText="Select exercises"
    />
  );
}
