import Colors from "@/constants/Colors";
import { FlatList, Pressable, Text } from "react-native";

export default function SubcategoryList(props: {
  selected: { categories?: string[] };
  subCategory: string;
  handleSelectSubCategory: (subCategory: string) => void;
}) {
  const backgroundColor = (item: string) => {
    return props.subCategory === item ? Colors.secondary : Colors.primary_light;
  };

  return (
    <FlatList
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 10 }}
      horizontal
      data={props.selected.categories}
      keyExtractor={(opt) => opt}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => props.handleSelectSubCategory(item)}
          style={[
            {
              backgroundColor: backgroundColor(item),
            },
            {
              padding: 7.5,
              paddingHorizontal: 15,
              marginRight: 10,
              borderRadius: 100,
            },
          ]}
        >
          <Text style={{ color: Colors.foreground }}>{item}</Text>
        </Pressable>
      )}
    />
  );
}
