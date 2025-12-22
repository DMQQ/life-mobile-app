import { memo } from "react"
import { Text, TextStyle } from "react-native"
import Animated, { AnimatedStyle, FadeInDown } from "react-native-reanimated"

interface AnimatedNumberProps {
    value: number
    style?: TextStyle | TextStyle[] | AnimatedStyle<TextStyle>
    formatValue?: (value: number) => string
    delay?: number
}

const AnimatedNumber = memo<AnimatedNumberProps>(
    ({ value, style, formatValue = (val) => val.toFixed(2), delay = 0 }) => {
        // const formattedValue = formatValue(value)
        // const characters = formattedValue.split("")

        // return (
        //     <Animated.View style={{ flexDirection: "row", alignItems: "baseline" }}>
        //         {characters.map((char, index) => (
        //             <Animated.Text
        //                 key={`${value}-${index}-${char}`}
        //                 entering={FadeInDown.delay(delay + index * 25)
        //                     .springify()
        //                     .damping(20)
        //                     .stiffness(200)}
        //                 style={style}
        //             >
        //                 {char}
        //             </Animated.Text>
        //         ))}
        //     </Animated.View>
        // )

        return (
            <Animated.View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Animated.Text style={style}>{formatValue(value)}</Animated.Text>
            </Animated.View>
        )
    },
    (prevProps, nextProps) => prevProps.value === nextProps.value,
)

export default AnimatedNumber
