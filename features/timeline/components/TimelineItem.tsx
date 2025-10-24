import Colors from "@/constants/Colors"
import { useNavigation } from "@react-navigation/native"
import moment from "moment"
import { useMemo } from "react"
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native"
import Ripple from "react-native-material-ripple"
import { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery"
import timelineStyles from "./timeline.styles"
import TodosPreviewSection from "./TodosPreviewSection"

export default function TimelineItem(
    timeline: GetTimelineQuery & {
        location: "timeline" | "root"
        textColor?: string
        styles?: StyleProp<ViewStyle>

        onLongPress?: () => void
    },
) {
    const navigation = useNavigation<any>()

    const onPress = () => {
        timeline.location === "root"
            ? navigation.navigate("TimelineScreens", {
                  timelineId: timeline.id,
              })
            : navigation.navigate("TimelineDetails", {
                  timelineId: timeline.id,
              })
    }

    const start = moment(timeline.beginTime, "HH:mm").format("HH:mm")

    const end = moment(timeline.endTime, "HH:mm").format("HH:mm")

    const isExpired = useMemo(() => {
        const now = moment()

        if (moment(timeline.date).isAfter(now)) return false

        if (timeline.isCompleted) return false

        const start = moment(timeline.beginTime, "HH:mm")
        const end = moment(timeline.endTime, "HH:mm")

        if (now.isAfter(end)) {
            return true
        }

        if (now.isAfter(start) && now.isBefore(end)) {
            return false
        }
    }, [timeline.date, timeline.beginTime, timeline.endTime, timeline.isCompleted])

    return (
        <Ripple
            onLongPress={timeline?.onLongPress}
            onPress={onPress}
            style={[timelineStyles.itemContainer, timeline.styles]}
        >
            <View style={{ flex: 1 }}>
                <View style={[timelineStyles.itemContainerTitleRow]}>
                    <Text
                        numberOfLines={1}
                        style={[timelineStyles.itemTitle, { ...(timeline.textColor && { color: timeline.textColor }) }]}
                    >
                        {timeline.title}
                    </Text>
                    <Text
                        style={[
                            timelineStyles.itemTimeLeft,
                            { ...(timeline.textColor && { color: timeline.textColor }) },
                        ]}
                    >
                        {start} - {end}
                    </Text>
                </View>
                <View style={styles.contentRow}>
                    <View style={styles.contentContainer}>
                        <Text
                            numberOfLines={2}
                            style={[
                                timelineStyles.itemDescription,
                                timeline.textColor && { color: timeline.textColor },
                            ]}
                        >
                            {timeline.description}
                        </Text>

                        <TodosPreviewSection
                            todos={timeline.todos}
                            timelineId={timeline.id}
                            textColor={timeline.textColor}
                            maxItems={3}
                        />
                    </View>
                </View>
                <View
                    style={[
                        styles.statusBadge,
                        timeline.isCompleted && styles.statusCompleted,
                        isExpired && styles.statusExpired,
                    ]}
                >
                    <Text style={timelineStyles.status}>
                        {timeline.isCompleted ? "Finished" : isExpired ? "Late" : "To do"}
                    </Text>
                </View>
            </View>
        </Ripple>
    )
}

const styles = StyleSheet.create({
    contentRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "flex-end",
        marginTop: 10,
        gap: 10,
    },
    contentContainer: {
        flex: 1,
    },
    statusBadge: {
        backgroundColor: Colors.secondary,
        padding: 2.5,
        paddingHorizontal: 10,
        borderRadius: 100,
        marginLeft: 2.5,
        alignSelf: "flex-end",
    },
    statusCompleted: {
        backgroundColor: "lightgreen",
    },
    statusExpired: {
        backgroundColor: "#BA4343",
    },
})
