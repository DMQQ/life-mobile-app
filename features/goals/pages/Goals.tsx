import { useGoal } from "../hooks/hooks";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { GoalCategory } from "../components/GoalCategory";
import Header from "@/components/ui/Header/Header";
import { AntDesign } from "@expo/vector-icons";
import Animated, { FadeOut, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import { Skeleton } from "@/components";
import Colors from "@/constants/Colors";

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

const AnimatedLoader = () => {
  return (
    <Animated.View
      exiting={FadeOut.duration(250)}
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: Colors.primary,
          zIndex: 1000,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 125,
        },
      ]}
    >
      <Skeleton>
        <View style={{ flex: 1, paddingHorizontal: 15 }}>
          <View style={{ alignItems: "flex-end" }}>
            <Skeleton.Item width={25} height={25} style={{ borderRadius: 10 }} />
          </View>

          <View style={{ paddingTop: 40, paddingBottom: 20 }}>
            <Skeleton.Item width={(w) => w * 0.65} height={65} style={{ marginTop: 10 }} />
            <Skeleton.Item width={(w) => w * 0.4} height={15} style={{ marginTop: 10 }} />
          </View>

          <View>
            <Skeleton.Item width={(w) => w - 30} height={200} style={{ marginTop: 10 }} />
            <Skeleton.Item width={(w) => w - 30} height={200} style={{ marginTop: 10 }} />
            <Skeleton.Item width={(w) => w - 30} height={200} style={{ marginTop: 10 }} />
          </View>
        </View>
      </Skeleton>
    </Animated.View>
  );
};

export default function Goals({ navigation }: any) {
  const { goals, loading } = useGoal();

  const scrollY = useSharedValue(0);

  const onAnimatedScrollHandler = useAnimatedScrollHandler(
    {
      onScroll(event) {
        scrollY.value = event.contentOffset.y;
      },
    },
    []
  );

  return (
    <View style={{ padding: 0, flex: 1 }}>
      {loading && <AnimatedLoader />}
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
          paddingBottom: 60,
        }}
        scrollEventThrottle={16}
        removeClippedSubviews
      />
    </View>
  );
}
