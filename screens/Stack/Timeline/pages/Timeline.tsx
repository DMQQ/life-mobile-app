import { View, Text, VirtualizedList } from "react-native";
import Calendar from "../../../../components/Calendar/Calendar";
import timelineStyles from "../components/timeline.styles";
import Ripple from "react-native-material-ripple";
import { TimelineScreenProps } from "../types";
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import DateList from "../../../../components/DateList/DateList";
import NotFound from "../../Home/components/NotFound";
import { TimelineScreenLoader } from "../components/LoaderSkeleton";
import useTimeline from "../hooks/general/useTimeline";
import { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery";
import TimelineItem from "../components/TimelineItem";
import Colors from "@/constants/Colors";

const iconColor = "#fff";

const ListHeaderComponent = (
  t: ReturnType<typeof useTimeline> & { navigation: any }
) => (
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

    <View style={timelineStyles.dateRow}>
      <Text style={timelineStyles.dayHeader}>{t.displayDate}</Text>

      <Ripple
        onPress={t.onViewToggle}
        style={{
          paddingHorizontal: 10,
        }}
      >
        {t.switchView === "calendar" ? (
          <AntDesign name="calendar" color={iconColor} size={24} />
        ) : (
          <Ionicons name="list" size={24} color={iconColor} />
        )}
      </Ripple>
    </View>

    <View style={timelineStyles.listHeadingContainer}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={timelineStyles.listHeadingText}>My events</Text>

        <Ripple
          style={{ padding: 2.5, marginLeft: 10 }}
          onPress={() =>
            t.navigation.navigate("Schedule", {
              selectedDate: t.selected,
            })
          }
        >
          <Entypo name="list" color={"#fff"} size={25} />
        </Ripple>
      </View>

      <Ripple
        style={{
          padding: 7.5,
          paddingHorizontal: 10,
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
        timeline.loading ? <TimelineScreenLoader loading /> : <NotFound />
      }
      contentContainerStyle={{
        padding: 10,
      }}
      data={(timeline.data?.timeline as GetTimelineQuery[]) || []}
      initialNumToRender={4}
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
