import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { StackScreenProps } from "@/types"
import { AntDesign } from "@expo/vector-icons"
import BottomSheetType from "@gorhom/bottom-sheet"
import Color from "color"
import { useRef } from "react"
import { StyleSheet, Text, View } from "react-native"
import Ripple from "react-native-material-ripple"
import Animated, {
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import FileList from "../components/FileList"
import LoaderSkeleton from "../components/LoaderSkeleton"
import TimelineHeader from "../components/TimelineHeader"
import TimelineTodos from "../components/TimelineTodos"
import useCompleteTimeline from "../hooks/mutation/useCompleteTimeline"
import useGetTimelineById from "../hooks/query/useGetTimelineById"

import { useSafeAreaInsets } from "react-native-safe-area-context"
import CreateTaskSheet from "../components/CreateTaskSheet"

const AnimatedRipple = Animated.createAnimatedComponent(Ripple)

const styles = StyleSheet.create({
    title: {
        marginBottom: 10,
        fontSize: 32.5,
        fontWeight: "bold",
        color: Colors.secondary,
    },
    container: {
        paddingBottom: 20,
        minHeight: Layout.screen.height - 120,
    },
    contentText: {
        fontSize: 20,
        color: "rgba(255,255,255,0.7)",
    },
    timelineIdText: {
        color: Color(Colors.primary).lighten(4).string(),
        marginTop: 25,
        position: "absolute",
        bottom: 0,
    },
    fab: {
        padding: 10,
        position: "absolute",
        right: 15,
        bottom: 25,
        backgroundColor: Colors.secondary,
        width: 60,
        height: 60,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
    },
})

export default function TimelineDetails({
    route,
    navigation,
}: StackScreenProps<{ TimelineDetails: { timelineId: string } }, "TimelineDetails">) {
    const { data, loading } = useGetTimelineById(route.params.timelineId)
    const [completeTimeline] = useCompleteTimeline(route.params.timelineId)
    const scrollY = useSharedValue(0)
    const onScroll = useAnimatedScrollHandler({
        onScroll(event) {
            if (scrollY.value) scrollY.value = event.contentOffset.y
        },
    })

    const fabAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: scrollY?.value > 40 ? withTiming(100, { duration: 250 }) : withTiming(0, { duration: 250 }),
            },
        ] as any,
    }))

    const onFabPress = () => {
        ;(navigation as any).navigate("TimelineCreate", {
            mode: "edit",
            selectedDate: data?.date,
            timelineId: data?.id,
        })
    }

    const taskRef = useRef<BottomSheetType>(null)

    const insets = useSafeAreaInsets()

    return (
        <View style={{ backgroundColor: Colors.primary, marginBottom: insets.bottom + 30 }}>
            <TimelineHeader
                title={data?.title.slice(0, 18)}
                scrollY={scrollY}
                isCompleted={data?.isCompleted}
                onTaskToggle={completeTimeline}
                navigation={navigation}
            />
            <Animated.ScrollView
                keyboardDismissMode={"on-drag"}
                style={{ padding: 15 }}
                contentContainerStyle={{ paddingBottom: 50 }}
                onScroll={onScroll}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <LoaderSkeleton />
                ) : (
                    <View style={styles.container}>
                        <Text selectable selectionColor={Colors.foreground} style={styles.title}>
                            {data?.title}
                        </Text>

                        <Text selectionColor={Colors.foreground} selectable style={styles.contentText}>
                            {data?.description || "(no content)"}
                        </Text>

                        <TimelineTodos
                            expandSheet={() => taskRef.current?.snapToIndex(0)}
                            timelineId={data?.id}
                            todos={data?.todos || []}
                        />

                        <FileList timelineId={data?.id} />

                        <Text selectable style={styles.timelineIdText}>
                            Event unique id: {data?.id}
                        </Text>
                    </View>
                )}
            </Animated.ScrollView>

            <AnimatedRipple style={[fabAnimatedStyle, styles.fab]} onPress={onFabPress}>
                <AntDesign name="edit" color={Colors.foreground} size={25} />
            </AnimatedRipple>

            <CreateTaskSheet ref={taskRef} timelineId={data?.id} />
        </View>
    )
}
