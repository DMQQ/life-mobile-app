import { useGoal } from "../hooks/hooks";
import { FlatList, SafeAreaView, Text, View } from "react-native";
import { GoalCategory } from "../components/GoalCategory";
import Header from "@/components/ui/Header/Header";
import { AntDesign } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

export default function Goals({ navigation }: any) {
  const { goals } = useGoal();

  const scrollY = useSharedValue(0);

  const onAnimatedScrollHandler = useAnimatedScrollHandler(
    {
      onScroll(event) {
        scrollY.value = event.contentOffset.y;
      },
    },
    []
  );

  const renderGoalsContent = ({ contentStyle, labelStyle }: any) => (
    <>
      <Text style={[{ fontSize: 60, fontWeight: "bold", color: "#fff", letterSpacing: 1 }, contentStyle]}>Goals</Text>
      <Animated.Text style={[{ color: "rgba(255,255,255,0.6)", fontSize: 16, textAlign: "center", opacity: 0.8 }, labelStyle]}>
        {goals.length} Active Goals
      </Animated.Text>
    </>
  );

  return (
    <SafeAreaView style={{ padding: 0, flex: 1, paddingBottom: 70 }}>
      <Header
        scrollY={scrollY}
        animated={true}
        animatedTitle="Goals"
        animatedSubtitle="5 Active Goals"
        buttons={[
          {
            onPress: () => navigation.navigate("CreateGoal"),
            icon: <AntDesign name="plus" size={20} color="#fff" />,
          },
        ]}
      />
      <AnimatedFlashList
        data={goals}
        estimatedItemSize={100}
        renderItem={({ item, index }: any) => (
          <GoalCategory
            index={index}
            onPress={() => {
              navigation.navigate("Goal", { id: item.id });
            }}
            {...item}
          />
        )}
        keyExtractor={(item: any) => item.id}
        onScroll={onAnimatedScrollHandler}
        contentContainerStyle={{
          padding: 15,
          paddingBottom: 100,
        }}
        scrollEventThrottle={16}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
}
