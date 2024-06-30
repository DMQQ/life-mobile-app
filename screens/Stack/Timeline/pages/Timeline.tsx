import { View, Text, VirtualizedList } from "react-native";
import Calendar from "../../../../components/Calendar/Calendar";
import timelineStyles from "../components/timeline.styles";
import Ripple from "react-native-material-ripple";
import { TimelineScreenProps } from "../types";
import { AntDesign, Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateList from "../../../../components/DateList/DateList";
import NotFound from "../../Home/components/NotFound";
import { TimelineScreenLoader } from "../components/LoaderSkeleton";
import useTimeline from "../hooks/general/useTimeline";
import { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery";
import TimelineItem from "../components/TimelineItem";
import Colors from "@/constants/Colors";
import { memo } from "react";
import Color from "color";

const iconColor = "#fff";

const ListHeaderComponent = memo(
  (t: ReturnType<typeof useTimeline> & { navigation: any }) => (
    <>
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
        />
      )}

      {/* <View style={timelineStyles.dateRow}>
        <Text style={timelineStyles.dayHeader}>{t.displayDate}</Text>

        <Ripple
          onPress={t.onViewToggle}
          style={{
            paddingHorizontal: 5,
          }}
        >
          {t.switchView === "calendar" ? (
            <AntDesign name="calendar" color={iconColor} size={24} />
          ) : (
            <Ionicons name="list" size={24} color={iconColor} />
          )}
        </Ripple>
      </View> */}

      <View style={timelineStyles.listHeadingContainer}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ripple
            onPress={t.onViewToggle}
            style={[timelineStyles.toggleButton, { marginRight: 10 }]}
          >
            {t.switchView === "calendar" && (
              <AntDesign name="calendar" color={"#fff"} size={23} />
            )}
            {t.switchView === "date-list" && (
              <Ionicons name="list" size={23} color={"#fff"} />
            )}
          </Ripple>
          <Ripple
            onPress={() =>
              t.navigation.navigate("Schedule", {
                selectedDate: t.selected,
              })
            }
            style={[timelineStyles.toggleButton]}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 16,
                padding: 2.5,
              }}
            >
              SCHEDULE
            </Text>
          </Ripple>

          {/* <Ripple
            style={timelineStyles.toggleButton}
            onPress={() =>
              t.navigation.navigate("Schedule", {
                selectedDate: t.selected,
              })
            }
          >
            <Text style={{ color: "#fff", fontWeight: "400", fontSize: 16 }}>
              Schedule
            </Text>
          </Ripple> */}
        </View>

        <Ripple
          style={{
            padding: 7.5,
            paddingHorizontal: 7.5 * 2,
            backgroundColor: Colors.secondary,
            borderRadius: 25,
          }}
          onPress={() => t.createTimeline()}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>
            CREATE EVENT
          </Text>
        </Ripple>
      </View>
    </>
  )
);

export default function Timeline({
  navigation,
  route,
}: TimelineScreenProps<"Timeline">) {
  const timeline = useTimeline({
    navigation,
    route,
  });

  return (
    <VirtualizedList
      ListHeaderComponent={
        <ListHeaderComponent {...timeline} navigation={navigation} />
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
      contentContainerStyle={{
        padding: 15,
      }}
      data={(timeline.data?.timeline as GetTimelineQuery[]) || []}
      initialNumToRender={3}
      keyExtractor={(item) => item.id}
      getItem={(data, index) => data[index] as GetTimelineQuery}
      getItemCount={(data) => data.length}
      renderItem={({ item }: { item: GetTimelineQuery }) => (
        <TimelineItem
          styles={{
            backgroundColor: Colors.primary_lighter,
            borderRadius: 15,
            padding: 20,
            marginBottom: 10,
          }}
          key={item.id}
          location="timeline"
          {...item}
        />
      )}
    />
  );
}
