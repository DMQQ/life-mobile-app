import ScreenContainer from "@/components/ui/ScreenContainer";
import TodaysTimelineEvents from "@/screens/Stack/Home/components/EventsWidget";
import AvailableBalanceWidget from "@/screens/Stack/Home/components/WalletWidget";
import { ScreenProps } from "@/types";
import { useAppSelector } from "@/utils/redux";
import { GET_MAIN_SCREEN } from "@/utils/schemas/GET_MAIN_SCREEN";
import { useQuery } from "@apollo/client";
import { ScrollView } from "react-native-gesture-handler";
import WorkoutWidget from "../Workout/components/WorkoutWidget";
import Header from "@/components/ui/Header/Header";
import { AntDesign } from "@expo/vector-icons";
import moment from "moment";
import useOffline from "@/utils/hooks/useOffline";

import SkeletonPlaceholder from "@/components/SkeletonLoader/Skeleton";
import { View } from "react-native";
import Layout from "@/constants/Layout";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { FancySpinner } from "@/components/ui/FancyLoader";
import { useState } from "react";

const LoadingSkeleton = () => {
  return (
    <Animated.View
      exiting={FadeOut.duration(500)}
      style={{
        flex: 1,
        width: Layout.screen.width,
        height: Layout.screen.height,
        position: "absolute",
        zIndex: 1000,
        backgroundColor: "#000",
        padding: 15,
      }}
    >
      {/* <FancySpinner size={100} /> */}

      <SkeletonPlaceholder size={(size) => size}>
        <View>
          {/* Main Balance */}
          <SkeletonPlaceholder.Item width={(w) => w - 30} height={35} />

          {/* Weekly Overview */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              width: Layout.screen.width - 30,
              marginTop: 15,
            }}
          >
            <SkeletonPlaceholder.Item width={(w) => (w - 30) / 2} height={50} />
            <SkeletonPlaceholder.Item width={(w) => (w - 30) / 3.5} height={30} />
          </View>

          <View style={{ marginTop: 12.5 }}>
            <SkeletonPlaceholder.Item width={(w) => w / 2} height={20} />
            <SkeletonPlaceholder.Item width={(w) => w - 30} height={20} />
            <SkeletonPlaceholder.Item width={(w) => w - 30} height={15} />
          </View>

          {/* Recent Transactions */}
          <View style={{ marginTop: 15 }}>
            <SkeletonPlaceholder.Item width={(w) => w - 30} height={25} />

            <View style={{ flexDirection: "row", gap: 15, marginTop: 5 }}>
              <SkeletonPlaceholder.Item width={(w) => w / 2.6} height={90} />
              <SkeletonPlaceholder.Item width={(w) => w / 2.6} height={90} />
              <SkeletonPlaceholder.Item width={(w) => w / 2.6} height={90} />
            </View>

            <View style={{ marginTop: 15 }}>
              <SkeletonPlaceholder.Item width={(w) => w / 2} height={20} />

              <SkeletonPlaceholder.Item width={(w) => w - 30} height={60} />
              <SkeletonPlaceholder.Item width={(w) => w - 30} height={60} marginTop={10} />
              <SkeletonPlaceholder.Item width={(w) => w - 30} height={60} marginTop={10} />
            </View>
          </View>

          {/* For Today Section */}
          <View style={{ marginTop: 30 }}>
            <SkeletonPlaceholder.Item width={(w) => w - 30} height={25} />
            <SkeletonPlaceholder.Item width={(w) => w - 30} height={70} marginTop={15} />
            <SkeletonPlaceholder.Item width={(w) => w - 30} height={70} marginTop={15} />
            <SkeletonPlaceholder.Item width={(w) => w - 30} height={70} marginTop={15} />
          </View>
        </View>
      </SkeletonPlaceholder>
    </Animated.View>
  );
};

export default function Root({ navigation }: ScreenProps<"Root">) {
  const workout = useAppSelector((s) => s.workout);

  const user = useAppSelector((s) => s.user);

  const offline = useOffline("RootScreen");

  const { data: gql } = useQuery(GET_MAIN_SCREEN, {
    variables: {
      range: [
        moment().subtract(1, "day").startOf("week").format("YYYY-MM-DD"),
        moment().subtract(1, "day").endOf("week").format("YYYY-MM-DD"),
      ],
    },
    onCompleted: (data) => {
      offline.save("RootScreen", data);

      setTimeout(() => {
        setLoading(false);
      }, 1000);
    },
    onError: (er) => console.log(JSON.stringify(er, null, 2)),
  });

  const [loading, setLoading] = useState(true);

  const data = offline.isOffline ? offline.data || {} : gql;

  return (
    <ScreenContainer style={{ padding: 0 }}>
      {loading && <LoadingSkeleton />}

      <Header
        titleAnimatedStyle={{}}
        title={`Hello, ${user?.user?.email.split("@")[0]}`}
        buttons={[
          {
            icon: <AntDesign name="setting" size={20} color="#fff" />,
            onPress: () => navigation.navigate("Settings"),
          },
        ]}
      />
      <ScrollView
        contentContainerStyle={{
          padding: 15,
        }}
      >
        <AvailableBalanceWidget
          data={{
            wallet: data?.wallet,
            statistics: {
              weeklySpendings: data?.weeklySpendings,
            },
          }}
          loading={loading}
        />

        <TodaysTimelineEvents data={data?.timelineByCurrentDate} loading={loading} />

        {workout.isWorkoutPending && <WorkoutWidget />}
      </ScrollView>
    </ScreenContainer>
  );
}
