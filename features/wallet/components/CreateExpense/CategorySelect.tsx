import Select, { Props } from "@/components/ui/Select/Select";
import Layout from "@/constants/Layout";
import Color from "color";
import Colors from "@/constants/Colors";
import { CategoryIcon, CategoryUtils, Icons } from "../Expense/ExpenseIcon";
import lowOpacity from "@/utils/functions/lowOpacity";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface CategorySelectProps<T> extends Partial<Props<T>> {
  selected: T[];
  onFocusChange?: (focused: boolean) => void;

  setSelected: (selected: T[]) => void;

  isActive: (category: T) => boolean;
}

export default function CategorySelect<T>(props: CategorySelectProps<T>) {
  return (
    <Select
      placeholderText="Choose category"
      transparentOverlay
      closeOnSelect
      containerStyle={{ borderRadius: 10 }}
      maxSelectHeight={Layout.screen.height * 0.35}
      {...props}
      onFocusChange={props.onFocusChange}
      selected={props.selected}
      setSelected={props.setSelected}
      options={Object.keys(Icons)}
      keyExtractor={(item) => item}
      renderDefaultItem={false}
      //@ts-ignore
      renderItem={(item) => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 0.5,
            borderBottomColor: Color(Colors.primary).lighten(4).hex(),
            padding: 2.5,
            backgroundColor: props.isActive(item.item) ? lowOpacity(Colors.secondary, 0.2) : undefined,
          }}
        >
          <CategoryIcon type="expense" category={item.item} clear />
          <Text style={{ color: "#fff", fontSize: 16, marginLeft: 10, fontWeight: "bold" }}>
            {CategoryUtils.getCategoryName(item.item)}
          </Text>
          {props.isActive(item.item) && (
            <MaterialCommunityIcons name="check" size={25} color={Colors.secondary} style={{ position: "absolute", right: 25 }} />
          )}
        </View>
      )}
    />
  );
}
