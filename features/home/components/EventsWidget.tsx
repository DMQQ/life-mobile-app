import ChipButton from "@/components/ui/Button/ChipButton"
import Text from "@/components/ui/Text/Text"
import Colors, { Sizing } from "@/constants/Colors"
import TimelineItem from "@/features/timeline/components/TimelineItem"
import { DATE_FORMAT } from "@/utils/functions/parseDate"
import { useNavigation } from "@react-navigation/native"
import Color from "color"
import moment from "moment"
import { StyleSheet, View } from "react-native"
import Animated from "react-native-reanimated"
import NotFound from "./NotFound"

const styles = StyleSheet.create({
    container: {
        marginTop: 30,
    },

    headContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },

    heading: {
        color: Colors.foreground,
        fontSize: 18,
        fontWeight: "bold",
    },
    button: {
        borderRadius: 100,
        padding: 5,
        paddingHorizontal: 10,
    },
    buttonText: {
        color: Colors.foreground,
        fontSize: 15,
    },

    notFoundContainer: {
        flexDirection: "column",
    },

    notFoundText: {
        fontSize: 20,
        padding: 10,
        fontWeight: "bold",
        color: Colors.foreground,
    },

    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Color(Colors.secondary).alpha(0.1).string(),
        padding: 8,
        paddingLeft: 12,
        borderRadius: 20,
        marginBottom: 10,
    },
    actionButtonText: {
        color: Colors.secondary,
        marginRight: 4,
        fontSize: Sizing.tooltip,
    },
})

export default function TodaysTimelineEvents(props: { data: any[]; loading: boolean }) {
    const navigation = useNavigation<any>()

    const date = moment()

    const isEmpty = props?.data?.length === 0 && !props.loading

    if (isEmpty)
        return (
            <Animated.View style={styles.container}>
                <Text style={[styles.heading, { marginBottom: 10 }]}>Daily events</Text>
                <NotFound selectedDate={date.format(DATE_FORMAT)} />
            </Animated.View>
        )

    return (
        <Animated.View style={styles.container}>
            <View style={styles.headContainer}>
                <Text variant="title" style={styles.heading}>
                    Events
                </Text>

                <ChipButton onPress={() => navigation.navigate("TimelineScreens")}>View all</ChipButton>
            </View>

            {props?.data?.slice(0, 3).map((timeline, index) => (
                <TimelineItem
                    styles={{
                        backgroundColor: Colors.primary_light,
                        borderRadius: 15,
                        padding: 20,
                    }}
                    key={timeline.id}
                    location="root"
                    {...timeline}
                />
            ))}
        </Animated.View>
    )
}
