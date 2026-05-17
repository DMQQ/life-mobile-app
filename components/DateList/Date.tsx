import { Padding } from "@/constants/Layout"
import { Rounded } from "@/constants/Values"
import Color from "color"
import moment from "moment"
import { memo } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import Haptic from "react-native-haptic-feedback"
import Animated, { FadeIn } from "react-native-reanimated"
import Colors from "../../constants/Colors"
import { Date as TDate } from "./fns"
import GlassView from "@/components/ui/GlassView"

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        borderRadius: Rounded.xl,
        width: 60,
        justifyContent: "center",
        height: 70,
        margin: Padding.xs,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: Rounded.full,
        marginRight: 1,
    },
})

interface DateProps extends TDate {
    isSelected: boolean
    onPress: Function
    tasks: number
    onLongPress: Function
}

const Dots = memo((props: { tasks: number[] }) =>
    props.tasks.length > 0 ? (
        <View style={{ flexDirection: "row", position: "absolute", top: -3, overflow: "hidden" }}>
            {props.tasks.map((_, i) => (
                <Animated.View entering={FadeIn} key={i} style={[styles.indicator, { backgroundColor: "#fff" }]} />
            ))}
        </View>
    ) : null,
)

const DateComponent = (props: DateProps) => {
    const tasks = Array.from(new Array(props?.tasks > 4 ? 4 : props.tasks).keys())
    const isToday = props.date === moment().format("YYYY-MM-DD")

    const tintColor = props.isSelected
        ? Color(Colors.secondary).alpha(0.55).toString()
        : isToday
          ? Color("#ffffff").alpha(0.15).toString()
          : undefined

    const date = new Date(props.date)

    return (
        <TouchableOpacity
            delayLongPress={250}
            onLongPress={() => {
                Haptic.trigger("impactMedium")
                props.onLongPress()
            }}
            onPress={() => props.onPress()}
            activeOpacity={0.85}
        >
            <GlassView key={tintColor} {...(tintColor && { tintColor })} style={styles.container}>
                <Dots tasks={tasks} />
                <Text
                    variant="title"
                    style={{
                        color: props.isSelected ? Colors.foreground : Color(Colors.foreground).alpha(0.75).toString(),
                        fontWeight: props.isSelected ? "bold" : "500",
                        fontSize: 23,
                    }}
                >
                    {date.getDate()}
                </Text>
                <Text
                    variant="body"
                    style={{
                        color: props.isSelected
                            ? Color(Colors.foreground).alpha(0.9).toString()
                            : Color(Colors.foreground).alpha(0.45).toString(),
                        fontSize: 13,
                    }}
                >
                    {date.getDay() === 0 ? "Sun" : moment.weekdays()[date.getDay()].slice(0, 3)}
                </Text>
            </GlassView>
        </TouchableOpacity>
    )
}

export default memo(DateComponent)
