import { View, Text, VirtualizedList, SafeAreaView } from "react-native";
import Calendar from "../../../../components/Calendar/Calendar";
import timelineStyles from "../components/timeline.styles";
import Ripple from "react-native-material-ripple";
import { TimelineScreenProps } from "../types";
import { AntDesign, Entypo, MaterialIcons } from "@expo/vector-icons";
import DateList from "../../../../components/DateList/DateList";
import NotFound from "../../Home/components/NotFound";
import { TimelineScreenLoader } from "../components/LoaderSkeleton";
import useTimeline from "../hooks/general/useTimeline";
import { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery";
import TimelineItem from "../components/TimelineItem";
import Colors from "@/constants/Colors";
import { memo } from "react";
import Color from "color";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Layout from "@/constants/Layout";
import Header from "@/components/ui/Header/Header";
import moment from "moment";

const ListHeaderComponent = memo(
  (
    t: ReturnType<typeof useTimeline> & {
      navigation: any;
      translateY: SharedValue<number>;
    }
  ) => (
    <View style={{ marginBottom: 25 }}>
      {t.switchView === "calendar" && (
        <Calendar
          selected={t.selected}
          monthData={t.monthData}
          refetch={t.refetch}
          onDayPress={t.onDayPress}
        />
      )}

      {t.switchView === "date-list" && (
        <DateList
          onMenuPress={() => t.setSwitchView("calendar")}
          dayEvents={t.dayEventsSorted}
          selectedDate={t.selected}
          setSelected={t.setSelected}
          translateY={t.translateY}
        />
      )}
    </View>
  )
);

const AnimatedVirtualizedList =
  Animated.createAnimatedComponent(VirtualizedList);

export default function Timeline({
  navigation,
  route,
}: TimelineScreenProps<"Timeline">) {
  const timeline = useTimeline({
    navigation,
    route,
  });

  const translateY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentScrollY = event.contentOffset.y;
      translateY.value = currentScrollY;
    },
  });

  const animatedTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, 50], [0, 1]),
  }));

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title={new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(moment(timeline.selected).toDate())}
          titleAnimatedStyle={animatedTitleStyle}
          buttons={[
            {
              onPress: () => navigation.navigate("Search"),
              icon: <MaterialIcons name="search" size={20} color="#fff" />,
            },
            {
              onPress: timeline.onViewToggle,
              icon: (
                <MaterialIcons
                  name={timeline.switchView === "calendar" ? "list" : "event"}
                  size={20}
                  color="#fff"
                />
              ),
            },
            {
              icon: <AntDesign name="plus" size={20} color="#fff" />,
              onPress: () => timeline.createTimeline(),
            },
          ]}
        />
        <AnimatedVirtualizedList
          ListHeaderComponent={
            <ListHeaderComponent
              translateY={translateY}
              navigation={navigation}
              {...timeline}
            />
          }
          ListEmptyComponent={
            timeline.loading ? (
              <TimelineScreenLoader loading />
            ) : (
              <View
                style={{
                  padding: 25,
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 25,
                }}
              >
                <NotFound />
              </View>
            )
          }
          onScroll={scrollHandler}
          contentContainerStyle={{
            paddingHorizontal: 15,
          }}
          CellRendererComponent={({ index, style, ...rest }) => {
            const newStyle = [style, { zIndex: -1 }];
            return <View style={newStyle} {...rest} />;
          }}
          data={(timeline.data?.timeline as GetTimelineQuery[]) || []}
          initialNumToRender={3}
          keyExtractor={(item: any) => item.id}
          getItem={(data, index) => data[index] as GetTimelineQuery}
          getItemCount={(data) => data.length}
          renderItem={({ item }: { item: GetTimelineQuery }): any => (
            <TimelineItem
              styles={{
                backgroundColor: Colors.primary_lighter,
                borderRadius: 15,
                padding: 20,
                marginBottom: 10,
                zIndex: 1,
              }}
              key={item.id}
              location="timeline"
              {...item}
            />
          )}
        />

        {/* <AnimatedPopNavigation
        isVisible={isVisible}
        onSchedulePress={() =>
          navigation.navigate("Schedule", {
            selectedDate: timeline.selected,
          })
        }
        onViewToggle={timeline.onViewToggle}
        onSearchPress={() => {}}
      /> */}
      </SafeAreaView>
    </>
  );
}

const AnimatedPopNavigation = ({
  isVisible,
  onSchedulePress,
  onSearchPress,
  onViewToggle,
}: {
  isVisible: SharedValue<boolean>;
  onSchedulePress: () => void;
  onViewToggle: () => void;
  onSearchPress: () => void;
}) => {
  const Separator = () => (
    <View
      style={{
        width: 1,
        height: "100%",
        backgroundColor: Color(Colors.primary).lighten(4).hex(),
      }}
    />
  );

  const TabButton = ({
    icon,
    text,
    onPress,
  }: {
    icon: any;
    text: string;
    onPress: (...rest: any) => any;
  }) => (
    <Ripple
      style={{ flexDirection: "row", gap: 5, alignItems: "center" }}
      onPress={onPress}
    >
      {icon}
      <Text style={{ color: "#fff", fontSize: 13 }}>{text}</Text>
    </Ripple>
  );

  const translation = useAnimatedStyle(() => ({
    transform: [
      { translateY: isVisible.value ? withTiming(0) : withTiming(100) },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          bottom: 10,
          width: Layout.screen.width,
          justifyContent: "center",
          alignItems: "center",
        },
        translation,
      ]}
    >
      <View
        style={{
          backgroundColor: Colors.primary_lighter,
          borderRadius: 100,
          padding: 10,
          paddingHorizontal: 7.5 * 3,
          borderWidth: 1,
          borderColor: Color(Colors.primary_lighter).lighten(1).hex(),
          flexDirection: "row",
          gap: 15,
        }}
      >
        <TabButton
          onPress={onSchedulePress}
          icon={<MaterialIcons name="event" size={15} color="#fff" />}
          text="Schedule"
        />

        <Separator />

        <TabButton
          onPress={onViewToggle}
          icon={<Entypo name="list" size={15} color="#fff" />}
          text="Grid|List"
        />

        <Separator />

        <TabButton
          onPress={onSearchPress}
          icon={<MaterialIcons name="search" size={15} color="#fff" />}
          text="Search"
        />
      </View>
    </Animated.View>
  );
};
