import Animated, { FadeInDown, LinearTransition } from "react-native-reanimated";
import { Icons } from "../ExpenseIcon";
import { useState } from "react";
import Input from "@/components/ui/TextInput/TextInput";
import Layout from "@/constants/Layout";
import Colors from "@/constants/Colors";
import lowOpacity from "@/utils/functions/lowOpacity";
import { Text, View } from "react-native";
import Ripple from "react-native-material-ripple";
import IconButton from "@/components/ui/IconButton/IconButton";
import { AntDesign } from "@expo/vector-icons";

const CategorySelector = (props: { current: string; onPress: (item: string) => void; dismiss: VoidFunction }) => {
  const data = Object.entries(Icons);

  const [query, setQuery] = useState("");

  return (
    <Animated.FlatList
      ListHeaderComponent={
        <Input
          placeholder="Search for category"
          value={query}
          onChangeText={setQuery}
          style={{ padding: 15 }}
          right={
            <IconButton
              onPress={() => props.dismiss()}
              icon={<AntDesign name="close" size={24} color={"rgba(255,255,255,0.7)"} />}
              style={{ padding: 0 }}
            />
          }
        />
      }
      layout={LinearTransition}
      entering={FadeInDown}
      style={{ width: "100%", height: Layout.screen.height / 2.25 }}
      data={data.filter((item) => item[0].toLowerCase().includes(query.toLowerCase()))}
      keyExtractor={(item) => item[0]}
      stickyHeaderIndices={[0]}
      renderItem={({ item, index }) => (
        <Animated.View
          entering={FadeInDown.delay(index * 75)}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            borderBottomWidth: 0.5,
            borderBottomColor: "rgba(255,255,255,0.15)",
            ...((item[0] === props.current && { backgroundColor: Colors.primary_light }) || {}),
            paddingRight: 15,
          }}
        >
          <Ripple
            onPress={() => props.onPress(item[0])}
            style={{ paddingVertical: 15, paddingHorizontal: 5.5, flexDirection: "row", gap: 15, alignItems: "center", flex: 1 }}
          >
            <View
              style={{
                padding: 10,
                borderRadius: 100,
                backgroundColor: lowOpacity(item[1].backgroundColor, 0.25),
                width: 40,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {item[1].icon}
            </View>

            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 18, textTransform: "capitalize", fontWeight: "600" }}>{item[0]}</Text>
          </Ripple>

          {item[0] === props.current && (
            <IconButton onPress={props.dismiss} icon={<AntDesign name="close" color={"rgba(255,255,255,0.7)"} size={24} />} />
          )}
        </Animated.View>
      )}
    />
  );
};

export default CategorySelector;
