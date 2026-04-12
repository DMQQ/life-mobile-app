import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import Url from "@/constants/Url"
import { StackScreenProps } from "@/types"
import Color from "color"
import { useCallback, useMemo, useState } from "react"
import { StyleSheet, View } from "react-native"
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import FileList from "../components/FileList"
import FloatingBottomToolBar from "../components/FloatingBottomToolBar"
import LoaderSkeleton from "../components/LoaderSkeleton"
import TimelineTodos from "../components/TimelineTodos"
import useCompleteOccurrence from "../hooks/mutation/useCompleteOccurrence"
import useGetOccurrenceById from "../hooks/query/useGetOccurrenceById"

import { Header } from "@/components"
import DeleteTimelineEvent from "@/components/ui/Dialog/Delete/DeleteTimelineEvent"
import { useActivityUtils } from "@/utils/hooks/useActivityManager"
import { useApolloClient } from "@apollo/client"
import axios from "axios"
import * as ImagePicker from "expo-image-picker"
import { AntDesign, Feather, FontAwesome, Ionicons } from "@expo/vector-icons"
import { HeaderItem } from "@/components/ui/Header/Header"

const styles = StyleSheet.create({
    title: {
        marginBottom: 10,
        color: Colors.secondary,
    },
    container: {
        paddingBottom: 20,
        minHeight: Layout.screen.height - 120,
    },
    contentText: {
        color: "rgba(255,255,255,0.7)",
    },
    timelineIdText: {
        color: Color(Colors.primary).lighten(4).string(),
        marginTop: 25,
        position: "absolute",
        bottom: 0,
    },
})

const capitalize = (text: string | undefined) => {
    if (!text) return ""
    return text.charAt(0).toUpperCase() + text.slice(1)
}

export default function TimelineDetails({
    route,
    navigation,
}: StackScreenProps<{ TimelineDetails: { timelineId: string } }, "TimelineDetails">) {
    const { data, loading } = useGetOccurrenceById(route.params.timelineId)
    const [completeOccurrence] = useCompleteOccurrence(route.params.timelineId)

    const scrollY = useSharedValue(0)

    const onScroll = useAnimatedScrollHandler({
        onScroll: (ev) => {
            scrollY.value = ev.contentOffset.y
        },
    })

    const onFabPress = () => {
        ;(navigation as any).navigate("TimelineCreate", {
            mode: "edit",
            selectedDate: data?.date,
            timelineId: data?.id,
        })
    }

    const { isPending, startActivity } = useActivityUtils(data?.id)

    const startLiveActivityLocally = useCallback(() => {
        if (!data || isPending) return

        startActivity({
            description: data.description || "",
            title: data.title || "No Title",
            endTime: data.endTime,
            startTime: data.beginTime,
            eventId: data.id,
            deepLinkURL: `mylife://timeline/id/${data.id}`,
            todos: data.todos || [],
            isCompleted: data.isCompleted,
        })
    }, [isPending, data])

    const [selectedEventForDeletion, setSelectedEventForDeletion] = useState<any | null>(null)

    const buttons = useMemo(
        () =>
            [
                {
                    icon: <Feather name="trash" size={20} color="#fff" />,
                    onPress: () => setSelectedEventForDeletion(data),
                },
                {
                    icon: <Feather name="edit-2" size={20} color={Colors.foreground} />,
                    onPress: onFabPress,
                },
                {
                    icon: data?.isCompleted ? (
                        <FontAwesome name="check-circle" size={20} color="#fff" />
                    ) : (
                        <AntDesign name={"check"} color={"#fff"} size={20} />
                    ),
                    standalone: true,
                    position: "right",
                    onPress: () => completeOccurrence({ variables: { id: data?.id, isCompleted: !data?.isCompleted } }),
                    tintColor: !data?.isCompleted ? Colors.secondary : "green",
                },
            ] as HeaderItem[],
        [data?.isCompleted, data, isPending],
    )

    const handleCreateTodo = useCallback(() => {
        ;(navigation as any).navigate("CreateTimelineTodos", {
            timelineId: data?.id,
        })
    }, [data?.id])

    const client = useApolloClient()
    const [uploadLoading, setUploadLoading] = useState(false)

    const uploadAssets = useCallback(
        async (assets: ImagePicker.ImagePickerAsset[]) => {
            if (!data?.id) return
            const formData = new FormData() as any
            assets.forEach((asset) => {
                formData.append("file", { uri: asset.uri, name: "File", type: "image/jpg" })
            })
            try {
                setUploadLoading(true)
                const { data: uploaded } = await axios.post(Url.API + "/upload/multiple", formData, {
                    params: { type: "timeline", entityId: data.id },
                    headers: { "Content-Type": "multipart/form-data" },
                })
                client.cache.modify({
                    id: "TimelineEntity:" + data.id,
                    fields: {
                        images: (existing = []) => [...uploaded, ...existing],
                    },
                })
            } catch {
                // silent
            } finally {
                setUploadLoading(false)
            }
        },
        [data?.id, client],
    )

    const handlePickImage = useCallback(async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            quality: 0.8,
            allowsMultipleSelection: true,
        })
        if (!result.canceled && result.assets.length > 0) await uploadAssets(result.assets)
    }, [uploadAssets])

    const handleTakePhoto = useCallback(async () => {
        await ImagePicker.requestCameraPermissionsAsync()
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: "images",
            quality: 1,
            allowsEditing: true,
        })
        if (!result.canceled && result.assets.length > 0) await uploadAssets(result.assets)
    }, [uploadAssets])

    return (
        <View style={{ backgroundColor: Colors.primary }}>
            <Header
                scrollY={scrollY}
                animated={true}
                animatedTitle={capitalize(data?.title)}
                buttons={buttons}
                initialTitleFontSize={data?.title?.length > 25 ? 40 : 50}
            />
            <Animated.ScrollView
                keyboardDismissMode={"on-drag"}
                style={{ padding: 15 }}
                contentContainerStyle={{ paddingBottom: 50, paddingTop: 225 + data?.title?.length * 3 }}
                onScroll={onScroll}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <LoaderSkeleton />
                ) : (
                    <View style={styles.container}>
                        <Text variant="body">{data?.description || "No description provided for this event."}</Text>
                        <TimelineTodos timelineId={data?.id} sortedTodos={data?.todos || []} />

                        <FileList timelineId={data?.id} />

                        <Text variant="caption" selectable style={styles.timelineIdText}>
                            Event unique id: {data?.id}
                        </Text>
                    </View>
                )}
            </Animated.ScrollView>

            <DeleteTimelineEvent
                isVisible={!!selectedEventForDeletion}
                item={
                    selectedEventForDeletion
                        ? {
                              id: selectedEventForDeletion.id,
                              name: selectedEventForDeletion.title,
                              date: selectedEventForDeletion.date,
                          }
                        : undefined
                }
                onDismiss={() => setSelectedEventForDeletion(null)}
            />

            <FloatingBottomToolBar
                activityPending={isPending}
                onStartActivity={startLiveActivityLocally}
                onAddTodo={handleCreateTodo}
                onPickImage={handlePickImage}
                onTakePhoto={handleTakePhoto}
                uploadLoading={uploadLoading}
                isCompleted={data?.isCompleted}
                onDo={() => (navigation as any).navigate("TimelineDo", { timelineId: data?.id })}
            />
        </View>
    )
}
