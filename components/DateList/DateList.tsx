import { Padding } from "@/constants/Values"
import { useNavigation } from "@react-navigation/native"
import moment, { Moment } from "moment"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { View, VirtualizedList } from "react-native"
import Animated, { SharedValue, useAnimatedStyle, interpolate } from "react-native-reanimated"
import Date from "./Date"
import MonthSelectList from "./MonthSelectList"
import { createDates } from "./fns"

import Colors from "@/constants/Colors"

interface DateListProps {
    selectedDate: string
    setSelected: React.Dispatch<React.SetStateAction<string>>
    dayEvents: {
        [key: string]: number
    }
    scrollY?: SharedValue<number>
}

const date = (today: Moment, month: string) => {
    const year = today.year()
    const monthIndex = moment.months().indexOf(month)
    return moment([year, monthIndex]).format("YYYY-MM-DD")
}

const getItemLayout = (_: any, index: number) => ({
    index,
    length: 60,
    offset: (60 + 5 * 2) * index,
})

const getItem = (arr: any, i: number) => arr[i] as any

const keyExtractor = (item: string) => item

const getItemCount = (arr: any) => arr.length

const DateList = memo(({ selectedDate, setSelected, dayEvents, scrollY }: DateListProps) => {
    const [month, setMonth] = useState(() => moment.months()[moment(selectedDate).month()])

    const [dates, setDates] = useState<string[]>(() => createDates(moment()))

    const listRef = useRef<VirtualizedList<string>>(null)

    const monthAnimatedStyle = useAnimatedStyle(() => {
        if (!scrollY) return { opacity: 1, height: 40 }
        return {
            opacity: interpolate(scrollY.value, [0, 50], [1, 0], "clamp"),
            height: interpolate(scrollY.value, [0, 50], [60, 0], "clamp"),
        }
    })

    const onMonthChange = useCallback(
        (newMonth: string) => {
            const realDate = moment()

            const dt = date(moment(selectedDate), newMonth)
            const newDates = createDates(moment(dt))

            if (newMonth === moment.months()[realDate.month()]) {
                setSelected(realDate.format("YYYY-MM-DD"))
            } else {
                const firstOfMonth = [...dt.split("-").slice(0, 2), "01"].join("-")
                setSelected(firstOfMonth)
            }

            setDates(newDates)
            setMonth(newMonth)
        },
        [selectedDate],
    )

    useEffect(() => {
        listRef.current?.scrollToItem({
            item: dates.find((d) => d === selectedDate)!,
            animated: false,
        })
    }, [month])

    const snapInterval = 60 + Padding.xs * 2

    const navigation = useNavigation<any>()

    const renderItem = useCallback(
        ({ item }: { item: string }) => (
            <Date
                tasks={dayEvents[item] || 0}
                date={item}
                isSelected={selectedDate === item}
                onPress={() => setSelected(item)}
                onLongPress={() => {
                    setSelected(item)
                    navigation.navigate("TimelineCreate", {
                        selectedDate: item,
                    })
                }}
            />
        ),
        [selectedDate, dayEvents],
    )

    const initialNumToRender = useMemo(() => (moment(selectedDate).get("d") < 5 ? 5 : 31), [selectedDate])

    return (
        <View style={{ backgroundColor: Colors.primary }}>
            <Animated.View style={monthAnimatedStyle}>
                <MonthSelectList selected={month} onPress={onMonthChange} />
            </Animated.View>
            <Animated.View>
                <VirtualizedList
                    initialNumToRender={initialNumToRender}
                    snapToInterval={snapInterval}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    removeClippedSubviews
                    showsHorizontalScrollIndicator={false}
                    getItemLayout={getItemLayout}
                    ref={listRef}
                    horizontal
                    getItem={getItem}
                    getItemCount={getItemCount}
                    data={dates}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    style={{ backgroundColor: Colors.primary }}
                />
            </Animated.View>
        </View>
    )
})

export default memo(DateList)
