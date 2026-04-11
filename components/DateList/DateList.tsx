import { Padding } from "@/constants/Values"
import { useNavigation } from "@react-navigation/native"
import moment from "moment"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { View, VirtualizedList } from "react-native"
import Date from "./Date"
import { createDates } from "./fns"

interface DateListProps {
    selectedDate: string
    setSelected: React.Dispatch<React.SetStateAction<string>>
    dayEvents: {
        [key: string]: number
    }
}

const getItemLayout = (_: any, index: number) => ({
    index,
    length: 60,
    offset: (60 + 5 * 2) * index,
})

const getItem = (arr: any, i: number) => arr[i] as any
const keyExtractor = (item: string) => item
const getItemCount = (arr: any) => arr.length

const DateList = memo(({ selectedDate, setSelected, dayEvents }: DateListProps) => {
    const [dates, setDates] = useState<string[]>(() => createDates(moment()))
    const listRef = useRef<VirtualizedList<string>>(null)

    useEffect(() => {
        listRef.current?.scrollToItem({
            item: dates.find((d) => d === selectedDate)!,
            animated: true,
        })
    }, [selectedDate])

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
                    navigation.navigate("TimelineCreate", { selectedDate: item })
                }}
            />
        ),
        [selectedDate, dayEvents],
    )

    const initialNumToRender = useMemo(() => (moment(selectedDate).get("d") < 5 ? 5 : 31), [selectedDate])

    return (
        <View style={{ paddingVertical: 4 }}>
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
            />
        </View>
    )
})

export default memo(DateList)
