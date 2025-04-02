import Header from "@/components/ui/Header/Header";
import Colors, { calendarTheme } from "@/constants/Colors";
import { AntDesign, FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import moment from "moment";
import { memo } from "react";
import { SafeAreaView, View, VirtualizedList } from "react-native";
import Animated, { interpolate, SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import Calendar from "../../../../components/Calendar/Calendar";
import DateList from "../../../../components/DateList/DateList";
import NotFound from "../../Home/components/NotFound";
import { TimelineScreenLoader } from "../components/LoaderSkeleton";
import TimelineItem from "../components/TimelineItem";
import useTimeline from "../hooks/general/useTimeline";
import { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery";
import { TimelineScreenProps } from "../types";
import DayTimeline from "../components/DayTimeline";

const ListHeaderComponent = memo(
  (
    t: ReturnType<typeof useTimeline> & {
      navigation: any;
      translateY: SharedValue<number>;
    }
  ) => (
    <View style={{ marginBottom: 25 }}>
      {t.switchView === "calendar" && (
        <Calendar selected={t.selected} monthData={t.monthData} refetch={t.refetch} onDayPress={t.onDayPress} />
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

const AnimatedVirtualizedList = Animated.createAnimatedComponent(VirtualizedList);

export default function Timeline({ navigation, route }: TimelineScreenProps<"Timeline">) {
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
              onPress: timeline.onViewToggle,
              icon:
                timeline.switchView === "calendar" ? (
                  <Ionicons name={"calendar-number"} size={20} color="#fff" />
                ) : timeline.switchView === "date-list" ? (
                  <FontAwesome name="list-alt" size={20} color="#fff" />
                ) : (
                  <MaterialIcons name="view-agenda" size={20} color="#fff" />
                ),
            },
            {
              icon: <AntDesign name="plus" size={20} color="#fff" />,
              onPress: () => timeline.createTimeline(),
            },
          ]}
        />
        {timeline.switchView !== "timeline" ? (
          <AnimatedVirtualizedList
            ListHeaderComponent={<ListHeaderComponent translateY={translateY} navigation={navigation} {...timeline} />}
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
                  <NotFound selectedDate={timeline.selected} />
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
        ) : (
          <DayTimeline
            onScroll={scrollHandler}
            selected={timeline.selected}
            date={timeline.selected}
            events={timeline.data?.timeline || []}
            theme={{}}
          >
            <View style={{ paddingHorizontal: 15, marginBottom: 50 }}>
              <DateList
                onMenuPress={() => timeline.setSwitchView("date-list")}
                dayEvents={timeline.dayEventsSorted}
                selectedDate={timeline.selected}
                setSelected={timeline.setSelected}
              />
            </View>
          </DayTimeline>
        )}
      </SafeAreaView>
    </>
  );
}
