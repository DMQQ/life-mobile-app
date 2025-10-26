import Colors from "@/constants/Colors"
import { useNavigation } from "@react-navigation/native"
import moment from "moment"
import { useMemo, useState } from "react"
import { StyleProp, StyleSheet, Text, View, ViewStyle, TouchableOpacity } from "react-native"
import Ripple from "react-native-material-ripple"
import { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery"
import timelineStyles from "./timeline.styles"
import TodosPreviewSection from "./TodosPreviewSection"
import { Card } from "@/components"
import { AntDesign } from "@expo/vector-icons"

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

    const handleCopyPress = (event: any) => {
        event.stopPropagation()
        navigation.navigate("CopyTimelineModal", {
            timelineId: timeline.id,
            timelineTitle: timeline.title,
            originalDate: timeline.date,
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
        <Card style={[timelineStyles.itemContainer, timeline.styles]}>
            <Ripple onLongPress={timeline?.onLongPress} onPress={onPress} style={{ flex: 1 }}>
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
                        {!!timeline.description && (
                            <Text
                                numberOfLines={2}
                                style={[
                                    timelineStyles.itemDescription,
                                    timeline.textColor && { color: timeline.textColor },
                                ]}
                            >
                                {timeline.description}
                            </Text>
                        )}

                        <TodosPreviewSection
                            todos={timeline.todos}
                            timelineId={timeline.id}
                            textColor={timeline.textColor}
                            maxItems={3}
                        />
                    </View>
                </View>
            </Ripple>

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <TouchableOpacity style={styles.copyButton} onPress={handleCopyPress} activeOpacity={0.7}>
                    <AntDesign name="copy" style={[styles.copyIcon, { color: Colors.text_dark }]} />
                    <Text style={[styles.copyText, { color: Colors.text_dark }]}>Copy</Text>
                </TouchableOpacity>
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
        </Card>
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
    copyButton: {
        borderRadius: 8,
        padding: 6,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    copyButtonDisabled: {
        opacity: 0.6,
        elevation: 0,
        shadowOpacity: 0,
    },
    copyIcon: {
        fontSize: 12,
    },
    copyText: {
        fontSize: 12,
        fontWeight: "600",
    },
})
