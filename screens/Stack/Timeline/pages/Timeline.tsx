import { View, Text, ScrollView } from "react-native";
import Calendar from "../../../../components/Calendar/Calendar";
import timelineStyles from "../components/timeline.styles";
import Ripple from "react-native-material-ripple";
import { TimelineScreenProps } from "../types";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import DateList from "../../../../components/DateList/DateList";
import NotFound from "../../Home/components/NotFound";
import { TimelineScreenLoader } from "../components/LoaderSkeleton";
import ListContainer from "../components/ListContainer";
import useTimeline from "../hooks/general/useTimeline";

const iconColor = "#fff";

export default function Timeline({
  navigation,
  route,
}: TimelineScreenProps<"Timeline">) {
  const {
    createTimeline,
    data,
    dayEventsSorted,
    displayDate,
    loading,
    monthData,
    onDayPress,
    onViewToggle,
    refetch,
    selected,
    setSelected,
    setSwitchView,
    switchView,
  } = useTimeline({
    navigation,
    route,
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {switchView === "calendar" && (
        <Calendar
          selected={selected}
          monthData={monthData}
          refetch={refetch}
          onDayPress={onDayPress}
        />
      )}

      {switchView === "date-list" && (
        <DateList
          onMenuPress={() => setSwitchView("calendar")}
          dayEvents={dayEventsSorted}
          selectedDate={selected}
          setSelected={setSelected}
        />
      )}

      <View style={timelineStyles.dateRow}>
        <Text style={timelineStyles.dayHeader}>{displayDate}</Text>

        <Ripple
          onPress={onViewToggle}
          style={{
            paddingHorizontal: 10,
          }}
        >
          {switchView === "calendar" ? (
            <AntDesign name="calendar" color={iconColor} size={24} />
          ) : (
            <Ionicons name="list" size={24} color={iconColor} />
          )}
        </Ripple>
      </View>

      <ListContainer
        date={selected}
        list={data?.timeline || []}
        navigation={navigation}
        onPress={createTimeline}
      />

      <TimelineScreenLoader loading={loading} />

      {!loading && data?.timeline.length === 0 && (
        <View style={timelineStyles.notFoundContainer}>
          <NotFound />
        </View>
      )}
    </ScrollView>
  );
}
