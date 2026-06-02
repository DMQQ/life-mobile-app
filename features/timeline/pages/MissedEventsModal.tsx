import { FONTS } from "@/constants/Fonts"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { FlatList, StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import { useMissedOccurrences } from "../hooks/query/useGetOccurrencesQuery"
import DayTimelineItemWrapper from "../components/DayTimelineItemWrapper"
import { TimelineScreenProps } from "../types"
import { useNavigation } from "@react-navigation/native"

const ITEM_STYLE = {
    height: 120,
    width: Layout.screen.width - 32,
}

export default function MissedEventsModal({ route }: TimelineScreenProps<"MissedEventsModal">) {
    const { eventIds } = route.params
    const { data, loading } = useMissedOccurrences(eventIds)
    const occurrences = data?.occurrences ?? []
    const navigation = useNavigation()

    return (
        <View style={styles.container}>
            {loading && occurrences.length === 0 ? (
                <Text variant="caption" style={styles.empty}>
                    Loading...
                </Text>
            ) : occurrences.length === 0 ? (
                <Text variant="caption" style={styles.empty}>
                    No missed events
                </Text>
            ) : (
                <FlatList
                    data={occurrences}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <DayTimelineItemWrapper
                            item={{ timeline: item }}
                            style={ITEM_STYLE}
                            onPress={() => navigation.goBack()}
                        />
                    )}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
        paddingTop: 24,
        paddingHorizontal: 16,
    },
    title: {
        color: Colors.foreground,
        marginBottom: 16,
        fontSize: 20,
        fontFamily: FONTS.bold,
    },
    list: {
        gap: 12,
        paddingBottom: 40,
    },
    empty: {
        color: Colors.foreground_secondary,
        textAlign: "center",
        marginTop: 40,
    },
})
