import Header from "@/components/ui/Header/Header"
import DatePicker from "@/components/DatePicker"
import DateList from "@/components/DateList/DateList"
import Colors from "@/constants/Colors"
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons"
import dayjs from "dayjs"
import moment from "moment"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { RefreshControl, TouchableOpacity, View, VirtualizedList } from "react-native"
import { useScreenSearch } from "@/utils/hooks/useScreenSearch"
import Feedback from "react-native-haptic-feedback"
import { TimelineScreenLoader } from "../components/LoaderSkeleton"
import TimelineItem from "../components/TimelineItem"
import TimelineDayPage from "../components/TimelineDayPage"
import useTimeline from "../hooks/general/useTimeline"
import { OccurrenceItem } from "../hooks/query/useGetOccurrencesQuery"
import { TimelineScreenProps } from "../types"
import Text from "@/components/ui/Text/Text"
import PagerView from "react-native-pager-view"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function Timeline({ navigation, route }: TimelineScreenProps<"Timeline">) {
    const timeline = useTimeline({ navigation, route })
    const insets = useSafeAreaInsets()
    const headerHeight = insets.top + 50

    const timeoutId = useRef<number | null>(null)
    const { isSearchActive } = useScreenSearch((query) => {
        if (timeoutId.current) clearTimeout(timeoutId.current)
        timeoutId.current = setTimeout(() => timeline.setQuery(query), 200)
    })

    const pagerRef = useRef<PagerView>(null)
    const isProgrammaticChange = useRef(false)

    const visibleDates = useMemo(() => {
        const selectedMoment = moment(timeline.selected)
        return [
            selectedMoment.clone().subtract(1, "day").format("YYYY-MM-DD"),
            timeline.selected,
            selectedMoment.clone().add(1, "day").format("YYYY-MM-DD"),
            selectedMoment.clone().add(2, "days").format("YYYY-MM-DD"),
        ]
    }, [timeline.selected])

    const lastSelectedRef = useRef(timeline.selected)
    useEffect(() => {
        if (timeline.selected !== lastSelectedRef.current) {
            lastSelectedRef.current = timeline.selected
            isProgrammaticChange.current = true
            pagerRef.current?.setPageWithoutAnimation(1)
            setTimeout(() => {
                isProgrammaticChange.current = false
            }, 100)
        }
    }, [timeline.selected])

    const handlePageSelected = useCallback(
        (e: any) => {
            if (isProgrammaticChange.current) return
            const position = e.nativeEvent.position
            const selectedDate = visibleDates[position]
            if (selectedDate && selectedDate !== timeline.selected) {
                Feedback.trigger("impactLight")
                isProgrammaticChange.current = true
                timeline.setSelected(selectedDate)
            }
        },
        [visibleDates, timeline.selected],
    )

    const renderItem = useCallback(
        ({ item }: { item: any }): any => (<TimelineItem {...item} location="timeline" />) as any,
        [],
    )

    const [refreshing, setRefreshing] = useState(false)
    const onRefresh = async () => {
        setRefreshing(true)
        await timeline.refetch()
        setRefreshing(false)
    }

    const selectedDate = moment(timeline.selected).toDate()
    const dateListHeight = 83
    const contentPaddingTop = headerHeight + dateListHeight

    return (
        <View style={{ flex: 1 }}>
            {timeline.loading && <TimelineScreenLoader />}

            <Header
                containerStyle={{ justifyContent: "space-between" }}
                buttons={[
                    !isSearchActive && timeline.query === ""
                        ? {
                              onPress: timeline.onViewToggle,
                              icon: <Feather name="repeat" size={20} color={Colors.foreground} />,
                          }
                        : undefined,

                    {
                        icon: <Ionicons name="sparkles" color={"#fff"} size={20} />,
                        onPress: () =>
                            navigation.navigate("AiOrganizer", {
                                selectedDate: moment(timeline.selected).format("YYYY-MM-DD"),
                            }),
                    },

                    {
                        icon: <AntDesign name="plus" size={20} color={Colors.foreground} />,
                        onPress: () => timeline.createTimeline(),
                    },
                ]}
                shadow={false}
            >
                <DatePicker
                    mode="single"
                    dates={{ start: selectedDate, end: selectedDate }}
                    setDates={(d) => timeline.setSelected(moment(d.start).format("YYYY-MM-DD"))}
                    buttonComponent={() => (
                        <TouchableOpacity>
                            <Text style={{ fontSize: 22, fontWeight: "bold", color: Colors.foreground }}>
                                {isSearchActive && timeline.query
                                    ? `"${timeline.query}"`
                                    : dayjs(timeline.selected).format("DD MMMM")}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </Header>

            {!isSearchActive && (
                <View style={{ position: "absolute", top: headerHeight, left: 0, right: 0, zIndex: 50 }}>
                    <DateList
                        dayEvents={timeline.dayEventsSorted}
                        selectedDate={timeline.selected}
                        setSelected={timeline.setSelected}
                    />
                </View>
            )}

            {isSearchActive ? (
                <VirtualizedList
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListHeaderComponent={<View style={{ height: 10 }} />}
                    ListEmptyComponent={
                        <View style={{ flex: 1, height: 400, justifyContent: "center", alignItems: "center" }}>
                            <Ionicons name="search" size={50} color={Colors.text_dark} style={{ marginBottom: 15 }} />
                            <Text style={{ color: Colors.text_dark }}>
                                No events found for "{timeline.query}", {"\n"}try changing the phrase
                            </Text>
                        </View>
                    }
                    contentContainerStyle={{
                        paddingBottom: (timeline.data?.occurrences?.length || 0) > 0 ? 120 : 0,
                        padding: 15,
                        paddingTop: headerHeight + 10,
                    }}
                    data={(timeline.data?.occurrences as OccurrenceItem[]) || []}
                    initialNumToRender={3}
                    keyExtractor={(item: any) => item.id}
                    getItem={(data, index) => data[index] as OccurrenceItem}
                    getItemCount={(data) => data.length}
                    renderItem={renderItem}
                />
            ) : (
                <PagerView ref={pagerRef} style={{ flex: 1 }} initialPage={1} onPageSelected={handlePageSelected}>
                    {visibleDates.map((date) => (
                        <View key={date} style={{ flex: 1 }}>
                            <TimelineDayPage
                                date={date}
                                switchView={timeline.switchView}
                                contentPaddingTop={contentPaddingTop}
                            />
                        </View>
                    ))}
                </PagerView>
            )}
        </View>
    )
}
