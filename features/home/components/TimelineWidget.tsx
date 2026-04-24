import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { GET_OCCURRENCES_QUERY } from "@/features/timeline/hooks/query/useGetOccurrencesQuery"
import { navigationRef } from "@/navigation"
import { useQuery } from "@apollo/client"
import { Feather } from "@expo/vector-icons"
import moment from "moment"
import { Pressable, StyleSheet, Text, View } from "react-native"
import Color from "color"
import Ripple from "react-native-material-ripple"
import TimelineItem from "@/features/timeline/components/TimelineItem"

function priorityColor(p: number) {
    if (p >= 7) return "#FF3B30"
    if (p >= 4) return "#007AFF"
    return "#34C759"
}

export default function TimelineWidget() {
    const { data } = useQuery(GET_OCCURRENCES_QUERY, {
        variables: { date: moment().format("YYYY-MM-DD") },
    })

    const events = data?.occurrences ?? []

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>Today</Text>
                <Ripple
                    style={styles.viewAll}
                    onPress={() => navigationRef.current?.navigate("TimelineScreens" as any)}
                >
                    <Text style={styles.viewAllText}>View all</Text>
                    <Feather name="chevron-right" size={12} color={Colors.secondary} />
                </Ripple>
            </View>

            {events.length === 0 ? (
                <Text style={styles.empty}>No events today</Text>
            ) : (
                events.slice(0, 5).map((event: any) => {
                    return <TimelineItem key={event.id} {...event} />
                })
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        width: Layout.screen.width - 30,
        alignSelf: "center",
        backgroundColor: Colors.primary_lighter,
        borderRadius: 14,
        padding: 14,
        gap: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 0.8,
        textTransform: "uppercase",
        color: Colors.text_dark,
    },
    viewAll: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        paddingVertical: 3,
        paddingHorizontal: 6,
        borderRadius: 8,
        backgroundColor: Color(Colors.secondary).alpha(0.1).string(),
    },
    viewAllText: {
        fontSize: 11,
        fontWeight: "600",
        color: Colors.secondary,
    },
    empty: {
        fontSize: 13,
        color: Colors.text_dark,
        textAlign: "center",
        paddingVertical: 12,
    },
    eventRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    priorityDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
    },
    timeCol: {
        width: 36,
        gap: 1,
    },
    timeText: {
        fontSize: 11,
        fontWeight: "700",
        color: Colors.text_light,
    },
    timeTextSub: {
        fontSize: 10,
        color: Colors.text_dark,
    },
    eventBody: {
        flex: 1,
        gap: 1,
    },
    eventTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.text_light,
    },
    eventDesc: {
        fontSize: 11,
        color: Colors.text_dark,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 10,
        fontWeight: "700",
    },
})
