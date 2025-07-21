import { Padding, Rounded } from "@/constants/Values"
import moment from "moment"
import { memo, useCallback, useEffect, useRef } from "react"
import { FlatList, Text } from "react-native"
import Ripple from "react-native-material-ripple"
import Colors from "../../constants/Colors"

interface MonthSelectListProps {
    selected: string
    onPress: (month: string) => void
}

const bg = Colors.primary_lighter

const getItemLayout = (_: any, index: number) => ({
    index,
    length: 100 + 5 * 2,
    offset: 110 * index,
})

function MonthSelectList(props: MonthSelectListProps) {
    const listRef = useRef<FlatList>(null)

    useEffect(() => {
        listRef.current?.scrollToItem({
            item: moment.months().find((m) => m === props.selected),
            animated: false,
        })
    }, [props.selected])

    const renderItem = useCallback(
        ({ item: month }: { item: string }) => (
            <Ripple
                onPress={() => props.onPress(month)}
                style={{
                    backgroundColor: props.selected === month ? Colors.secondary : bg,
                    marginHorizontal: Padding.xs,
                    borderRadius: Rounded.m,
                    width: 100,
                    height: 45,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text style={{ color: Colors.foreground, fontSize: 16 }}>{month}</Text>
            </Ripple>
        ),
        [props.selected],
    )

    return (
        <FlatList
            ref={listRef}
            getItemLayout={getItemLayout}
            style={{ marginBottom: Padding.m }}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={110}
            snapToAlignment="start"
            decelerationRate="fast"
            data={moment.months()}
            keyExtractor={(month) => month}
            renderItem={renderItem}
        />
    )
}

export default memo(MonthSelectList)
