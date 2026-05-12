import Colors from "@/constants/Colors"
import { GET_OCCURRENCES_QUERY } from "@/features/timeline/hooks/query/useGetOccurrencesQuery"
import { useQuery } from "@apollo/client"
import moment from "moment"
import { StyleSheet, Text, View } from "react-native"
import Color from "color"
import TimelineItem from "@/features/timeline/components/TimelineItem"
import Section from "@/components/ui/Section"

export default function TimelineWidget() {
    const { data } = useQuery(GET_OCCURRENCES_QUERY, {
        variables: { date: moment().format("YYYY-MM-DD") },
    })

    const events = data?.occurrences ?? []

    if (!events || events.length === 0) return null

    return (
        <Section title="Today">
            <View style={styles.card}>
                {events.length === 0 ? (
                    <Text style={styles.empty}>No events today</Text>
                ) : (
                    events.slice(0, 5).map((event: any) => {
                        return <TimelineItem key={event.id} {...event} />
                    })
                )}
            </View>
        </Section>
    )
}

const styles = StyleSheet.create({
    card: {
        padding: 15,
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
