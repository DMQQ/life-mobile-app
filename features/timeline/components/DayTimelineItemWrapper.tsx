import Colors from "@/constants/Colors"
import { useNavigation } from "@react-navigation/native"
import { useCallback, useMemo } from "react"
import { Pressable, View } from "react-native"
import Color from "color"
import ContextMenu from "@/components/ui/ContextMenu"
import useRemoveTimelineMutation from "../hooks/mutation/useRemoveTimelineMutation"
import { useActivityUtils } from "@/utils/hooks/useActivityManager"
import useCompleteTimeline from "../hooks/mutation/useCompleteTimeline"
import DayTimelineItem from "./DayTimelineItem"

interface DayTimelineItemWrapperProps {
    item: any
    style: any
    onLongPress?: (timeline: any) => void
}

export default function DayTimelineItemWrapper({ item, style, onLongPress }: DayTimelineItemWrapperProps) {
    const textColor = Colors.foreground
    const timeline = item.timeline
    const navigation = useNavigation<any>()

    const { remove } = useRemoveTimelineMutation(timeline || { id: "", date: "", name: "" })
    const { isPending, startActivity } = useActivityUtils(timeline?.id)
    const [completeTimeline] = useCompleteTimeline(timeline.id)

    const handleCopyPress = useCallback(() => {
        navigation.navigate("CopyTimelineModal", {
            timelineId: timeline.id,
            timelineTitle: timeline.title,
            originalDate: timeline.date,
        })
    }, [navigation, timeline.id, timeline.title, timeline.date])

    const startLiveActivityLocally = useCallback(() => {
        if (!timeline || isPending) return

        startActivity({
            description: timeline.description || "",
            title: timeline.title || "No Title",
            endTime: timeline.endTime as any,
            startTime: timeline.beginTime as any,
            eventId: timeline.id,
            deepLinkURL: `mylife://timeline/id/${timeline.id}`,
            todos: timeline.todos || [],
            isCompleted: timeline.isCompleted,
        })
    }, [isPending, timeline, startActivity])

    const items = useMemo(
        () =>
            [
                {
                    leading: "bell",
                    text: isPending ? "Activity pending" : "Start live activity",
                    onPress: startLiveActivityLocally,
                    disabled: isPending,
                },
                !timeline.isCompleted && {
                    leading: "checkmark",
                    text: "Complete",
                    onPress: completeTimeline,
                },
                {
                    leading: "clipboard",
                    text: "Copy",
                    onPress: handleCopyPress,
                },
                {
                    leading: "pencil",
                    text: "Edit",
                    onPress: () => {
                        navigation.navigate("TimelineCreate", {
                            mode: "edit",
                            selectedDate: timeline?.date,
                            timelineId: timeline?.id,
                        })
                    },
                },
                {
                    leading: "trash",
                    text: "Delete",
                    onPress: () => {
                        remove()
                    },
                    destructive: true,
                },
            ].filter(Boolean),
        [completeTimeline, handleCopyPress, isPending, navigation, remove, startLiveActivityLocally, timeline],
    )

    const onPress = () => {
        timeline.location === "root"
            ? navigation.navigate("TimelineScreens", {
                  timelineId: timeline.id,
              })
            : navigation.navigate("TimelineDetails", {
                  timelineId: timeline.id,
              })
    }

    return (
        <ContextMenu anchor="right" items={items as any} style={[style]}>
            <Pressable
                onLongPress={() => onLongPress?.(timeline)}
                onPress={onPress}
                style={[
                    {
                        backgroundColor: Color(Colors.primary_lighter).lighten(0.25).toString(),
                        borderRadius: 10,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: "#222222ff",
                        padding: 10,
                        flex: 1,
                    },
                    timeline.isCompleted && {
                        opacity: 0.5,
                    },
                    style,
                ]}
            >
                <View style={{ flex: 1 }}>
                    <DayTimelineItem
                        {...timeline}
                        location="timeline"
                        textColor={textColor}
                        styles={{
                            flex: 1,
                        }}
                        isSmall={style.height < 100}
                    />
                </View>
            </Pressable>
        </ContextMenu>
    )
}
