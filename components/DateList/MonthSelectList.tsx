import moment from "moment";
import { useCallback, useLayoutEffect, useRef } from "react";
import { FlatList } from "react-native-gesture-handler";
import Ripple from "react-native-material-ripple";
import Colors from "../../constants/Colors";
import { Text } from "react-native";
import Color from "color";
import { Padding, Rounded } from "@/constants/Values";

interface MonthSelectListProps {
  selected: string;
  onPress: (month: string) => void;
}

const bg = Color(Colors.primary).lighten(0.5).hex();

const getItemLayout = (_: any, index: number) => ({
  index,
  length: 100 + 5 * 2,
  offset: 110 * index,
});

export default function MonthSelectList(props: MonthSelectListProps) {
  const listRef = useRef<FlatList>(null);

  useLayoutEffect(() => {
    listRef.current?.scrollToItem({
      item: moment.months().find((m) => m === props.selected),
    });
  }, [props.selected]);

  const renderItem = useCallback(
    ({ item: month }: { item: string }) => (
      <Ripple
        onPress={() => props.onPress(month)}
        style={{
          backgroundColor: props.selected === month ? Colors.secondary : bg,
          marginHorizontal: Padding.xs,
          borderRadius: Rounded.m,
          width: 100,
          height: 45,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16 }}>{month}</Text>
      </Ripple>
    ),
    [props.selected]
  );

  return (
    <FlatList
      ref={listRef}
      getItemLayout={getItemLayout}
      style={{ marginBottom: Padding.m, padding: Padding.xs }}
      horizontal
      showsHorizontalScrollIndicator={false}
      data={moment.months()}
      keyExtractor={(month) => month}
      renderItem={renderItem}
    />
  );
}
