import { Padding } from "@/constants/Layout"
import { Rounded } from "@/constants/Values"
import Color from "color"
import moment from "moment"
import { memo } from "react"
import { StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import Haptic from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import Animated, { FadeIn } from "react-native-reanimated"
import Colors, { secondary_candidates } from "../../constants/Colors"
import { Date as TDate } from "./fns"

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        borderRadius: Rounded.m,
        width: 75,
        justifyContent: "center",
        height: 100,
        margin: Padding.xs,
    },
    indicator: {
        width: 10,
        height: 10,
        borderRadius: Rounded.full,
        marginRight: 1,
        borderWidth: 0.5,
        borderColor: Colors.primary,
    },
})

interface DateProps extends TDate {
    isSelected: boolean

    onPress: Function

    tasks: number

    onLongPress: Function
}

const bg = Colors.primary_lighter

const months = moment.months()

const Dots = memo((props: { tasks: number[] }) =>
    props.tasks.length > 0 ? (
        <View style={{ flexDirection: "row", position: "absolute", top: -3 }}>
            {props.tasks.map((_, i) => (
                <Animated.View
                    entering={FadeIn}
                    key={i}
                    style={[styles.indicator, { backgroundColor: secondary_candidates[i] }]}
                />
            ))}
        </View>
    ) : null,
)

const DateComponent = (props: DateProps) => {
    const tasks = Array.from(new Array(props?.tasks > 4 ? 4 : props.tasks).keys())

    const dateItemBg = props.isSelected
        ? Color(Colors.secondary).opaquer(0.5).hex()
        : props.date === moment().format("YYYY-MM-DD")
          ? Color(bg).lighten(0.5).hex()
          : bg

    const date = new Date(props.date)

    return (
        <Ripple
            delayLongPress={250}
            onLongPress={() => {
                Haptic.trigger("impactMedium")
                props.onLongPress()
            }}
            onPress={() => props.onPress()}
            style={[styles.container, { backgroundColor: dateItemBg }]}
        >
            <Dots tasks={tasks} />
            <Text variant="title" style={{ color: Colors.foreground, fontWeight: "bold" }}>{date.getDate()}</Text>
            <Text variant="body" style={{ color: "#ffffffcb" }}>
                {date.getDay() === 0 ? "Sun" : moment.weekdays()[date.getDay()].slice(0, 3)}
            </Text>
            <Text variant="caption" style={{ color: "#ffffff8c" }}>{months[date.getMonth()].slice(0, 3)}</Text>
        </Ripple>
    )
}

export default memo(DateComponent)
