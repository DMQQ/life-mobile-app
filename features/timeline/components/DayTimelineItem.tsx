import { AntDesign, MaterialIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import moment from "moment"
import { useMemo } from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import Ripple from "react-native-material-ripple"
import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import { GetTimelineQuery } from "../hooks/query/useGetTimeLineQuery"
import timelineStyles from "./timeline.styles"

export default function DayTimelineItem(
    timeline: GetTimelineQuery & {
        location: "timeline" | "root"
        textColor?: string
        styles?: StyleProp<ViewStyle>

        isSmall: boolean

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
            onLongPress={timeline.onLongPress}
            onPress={onPress}
            style={[timelineStyles.itemContainer, timeline.styles]}
        >
            <View style={{ flex: 1 }}>
                <View style={[timelineStyles.itemContainerTitleRow]}>
                    <View style={{ flexDirection: "row", gap: 5 }}>
                        <View>
                            {timeline.isCompleted ? (
                                <AntDesign name="check" color={Colors.foreground} size={18} />
                            ) : isExpired ? (
                                <AntDesign name="clockcircle" size={18} color={Colors.foreground} />
                            ) : (
                                <MaterialIcons name="pending" color={Colors.foreground} size={18} />
                            )}
                        </View>
                        <Text
                            variant="subtitle"
                            numberOfLines={1}
                            style={[
                                timelineStyles.itemTitle,
                                { ...(timeline.textColor && { color: timeline.textColor }) },
                            ]}
                        >
                            {timeline.title}
                        </Text>
                    </View>
                    <Text
                        variant="caption"
                        style={[
                            timelineStyles.itemTimeLeft,
                            { ...(timeline.textColor && { color: timeline.textColor }) },
                        ]}
                    >
                        {start} - {end}
                    </Text>
                </View>
                {!timeline.isSmall && (
                    <View
                        style={{
                            flexWrap: "wrap",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: 2.5,
                            gap: 10,
                            flex: 1,
                        }}
                    >
                        <Text
                            variant="caption"
                            numberOfLines={3}
                            style={[
                                timelineStyles.itemDescription,
                                { flex: 1 },
                                { ...(timeline.textColor && { color: timeline.textColor }) },
                            ]}
                        >
                            {timeline.description}
                        </Text>
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            {timeline.todos.length > 0 && (
                                <Text variant="caption" color={Colors.foreground}>
                                    {timeline.todos.length} {timeline.todos.length > 1 ? "todos" : "todo"}
                                </Text>
                            )}
                            {timeline.images.length > 0 && (
                                <Text variant="caption" color={Colors.foreground}>
                                    {timeline.images.length} {timeline.images.length > 1 ? "images" : "image"}
                                </Text>
                            )}
                        </View>
                    </View>
                )}
            </View>
        </Ripple>
    )
}
