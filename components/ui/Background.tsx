import { StyleSheet, View, Dimensions } from "react-native"
import Svg, { Defs, RadialGradient, Stop, Circle, Filter, FeGaussianBlur } from "react-native-svg"
import theme, { secondary_candidates } from "@/constants/Colors"
import { LinearGradient } from "expo-linear-gradient"

const { width } = Dimensions.get("window")
const HEIGHT = 320

const CIRCLE_RADIUS = width * 0.55

export default function Background({ tintColor = theme.secondary_dark_1 }: { tintColor?: string }) {
    const accentColor = tintColor

    return (
        <View style={styles.container} pointerEvents="none">
            <LinearGradient style={StyleSheet.absoluteFill} colors={[accentColor + "15", "transparent"]} />
            <Svg height={HEIGHT} width={width}>
                <Defs>
                    {/* Kept the blur but contained it tightly to preserve the round structure */}
                    <Filter id="glowBlur" x="-30%" y="-30%" width="160%" height="160%">
                        <FeGaussianBlur stdDeviation="30" />
                    </Filter>

                    <RadialGradient
                        id="topGlow"
                        cx="50%" // Center X: Middle of the screen
                        cy="15%" // Center Y: Lowered slightly to show the top curve of the circle
                        rx="50%" // Symmetrical aspect ratio (1:1) forces a true circle
                        ry="50%"
                        fx="50%"
                        fy="15%"
                    >
                        {/* High core opacity fading quickly to define the circular edge */}
                        <Stop offset="0%" stopColor={accentColor} stopOpacity="1" />
                        <Stop offset="50%" stopColor={accentColor} stopOpacity="0.6" />
                        <Stop offset="85%" stopColor={accentColor} stopOpacity="0.3" />
                        <Stop offset="100%" stopColor={accentColor} stopOpacity="0.1" />
                    </RadialGradient>
                </Defs>

                <Circle
                    cx={width / 2}
                    cy={20} // Pushed down past the top edge to reveal the orb shape
                    r={CIRCLE_RADIUS}
                    fill="url(#topGlow)"
                    filter="url(#glowBlur)"
                />
            </Svg>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFill,
        position: "absolute",
        backgroundColor: "transparent",
    },
})
