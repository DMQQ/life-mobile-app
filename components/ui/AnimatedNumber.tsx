import { memo } from "react"
import { Text, TextStyle } from "react-native"
import Animated, { AnimateStyle, FadeInDown } from "react-native-reanimated"

interface AnimatedNumberProps {
    value: number
    style?: TextStyle | TextStyle[] | AnimateStyle<TextStyle>
    formatValue?: (value: number) => string
    delay?: number
}

const AnimatedNumber = memo<AnimatedNumberProps>(
    ({ value, style, formatValue = (val) => val.toFixed(2), delay = 0 }) => {
        const formattedValue = formatValue(value)
        const characters = formattedValue.split("")

        return (
            <Animated.View style={{ flexDirection: "row", alignItems: "baseline" }}>
                {characters.map((char, index) => (
                    <Animated.View
                        key={`${value}-${index}-${char}`}
                        entering={FadeInDown.delay(delay + index * 25)
                            .springify()
                            .damping(20)
                            .stiffness(200)}
                    >
                        <Text style={style}>{char}</Text>
                    </Animated.View>
                ))}
            </Animated.View>
        )
    },
    (prevProps, nextProps) => prevProps.value === nextProps.value,
)

export default AnimatedNumber
