import { Padding } from "@/constants/Values"
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import moment from "moment"
import { useEffect } from "react"
import { Platform, StyleSheet } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import Animated, {
    FadeInDown,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import Colors from "../../constants/Colors"
import Layout from "../../constants/Layout"
import { useTheme } from "../../utils/context/ThemeContext"
import useKeyboard from "../../utils/hooks/useKeyboard"
import BlurSurface from "../ui/BlurSurface"

const styles = StyleSheet.create({
    container: {
        width: Layout.screen.width,
        justifyContent: "space-around",
        flexDirection: "row",
        position: "absolute",
        bottom: 0,
        height: 90,
    },
    button: {
        padding: 5,
        paddingVertical: 10,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 15,
        position: "relative",
    },
    innerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "rgba(0,0,0,0.1)",
        position: "relative",
    },
    activeIndicator: {
        position: "absolute",
        top: 15,
        height: 45,
        backgroundColor: Colors.secondary,
        borderRadius: 22.5,
        opacity: 0.15,
        shadowColor: Colors.secondary,
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.7,
        shadowRadius: 16.0,

        elevation: 24,
    },
    activeDot: {
        position: "absolute",
        top: -5,
        width: 6,
        height: 6,
        backgroundColor: Colors.secondary,
        borderRadius: 3,
    },
})

export default function BottomTab({ navigation, state, insets }: BottomTabBarProps) {
    const navigate = (route: string) => navigation.navigate(route)
    const activeRoute = state.routes[state.index].name
    const { theme } = useTheme()

    const routes = ["NotesScreens", "GoalsScreens", "Root", "WalletScreens", "TimelineScreens"]
    const activeIndex = routes.indexOf(activeRoute)
    const buttonWidth = Layout.screen.width / state.routes.length

    const indicatorPosition = useSharedValue(activeIndex * buttonWidth)
    const iconScale = useSharedValue(1)

    useEffect(() => {
        indicatorPosition.value = withSpring(activeIndex * buttonWidth, {
            damping: 20,
            stiffness: 150,
        })

        iconScale.value = withSequence(withTiming(0.9, { duration: 100 }), withTiming(1, { duration: 150 }))

        runOnJS(Feedback.trigger)("impactLight")
    }, [activeRoute])

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: indicatorPosition.value + buttonWidth * 0.2 }],
        width: buttonWidth * 0.6,
    }))

    const Btn = (props: { route: string; iconName: any; label: string; onLongPress?: any; index: number }) => {
        const isActive = activeRoute === props.route

        const buttonAnimatedStyle = useAnimatedStyle(() => {
            const scale = isActive ? iconScale.value : 1
            return {
                transform: [{ scale }],
            }
        })

        const iconAnimatedStyle = useAnimatedStyle(() => {
            const translateY = isActive ? interpolate(iconScale.value, [1, 1.2, 1], [0, -2, 0]) : 0
            return {
                transform: [{ translateY }],
            }
        })

        return (
            <Ripple
                onLongPress={props.onLongPress}
                rippleCentered
                rippleColor={theme.colors.secondary}
                style={[
                    styles.button,
                    {
                        width: buttonWidth,
                    },
                ]}
                onPress={() => navigate(props.route)}
            >
                <Animated.View style={[buttonAnimatedStyle, { alignItems: "center" }]}>
                    <Animated.View style={iconAnimatedStyle}>
                        {typeof props.iconName === "string" ? (
                            <Ionicons
                                size={22.5}
                                name={props.iconName as any}
                                color={isActive ? Colors.secondary : "rgba(255,255,255,0.8)"}
                                style={{
                                    marginBottom: 2.5,
                                    paddingVertical: 7.5,
                                    ...(isActive && {
                                        shadowColor: Colors.secondary,
                                        shadowOffset: {
                                            width: 0,
                                            height: 10,
                                        },
                                        shadowOpacity: 0.7,
                                        shadowRadius: 16.0,

                                        elevation: 24,
                                    }),
                                }}
                            />
                        ) : (
                            props.iconName
                        )}
                    </Animated.View>
                </Animated.View>
            </Ripple>
        )
    }

    const keyboard = useKeyboard()
    const isOpenSubScreen = (state.routes[state.index].state?.index || 0) > 0

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: isOpenSubScreen || keyboard ? withTiming(100, { duration: 100 }) : withTiming(0),
            },
        ],
    }))

    return (
        <Animated.View
            style={[styles.container, animatedStyle]}
            entering={FadeInDown.duration(150)}
            exiting={FadeInDown.duration(150)}
        >
            <BlurSurface
                style={[
                    styles.innerContainer,
                    {
                        paddingBottom: Platform.OS === "android" ? Padding.s + insets.bottom : Padding.xxl,
                        paddingTop: Platform.OS === "android" ? insets.bottom + Padding.s : Padding.s,
                    },
                ]}
            >
                <Animated.View style={[styles.activeIndicator, indicatorStyle]} />

                <Btn
                    index={0}
                    route="NotesScreens"
                    label="Notes"
                    iconName={
                        <MaterialCommunityIcons
                            name="cards"
                            size={22.5}
                            color={activeRoute === "NotesScreens" ? Colors.secondary : "rgba(255,255,255,0.8)"}
                        />
                    }
                />

                <Btn
                    index={1}
                    route="GoalsScreens"
                    label="Training"
                    iconName={
                        <Feather
                            name="target"
                            size={22.5}
                            color={activeRoute === "GoalsScreens" ? Colors.secondary : "rgba(255,255,255,0.8)"}
                            style={{ marginBottom: 2.5, paddingVertical: 7.5 }}
                        />
                    }
                />

                <Btn index={2} route="Root" label="Home" iconName={"home"} />

                <Btn
                    index={3}
                    onLongPress={() => {
                        Feedback.trigger("impactMedium")
                        navigation.navigate({
                            name: "WalletScreens",
                            params: {
                                expenseId: null,
                            },
                        })
                    }}
                    route="WalletScreens"
                    label="Wallet"
                    iconName={"wallet"}
                />

                <Btn
                    index={4}
                    onLongPress={() => {
                        Feedback.trigger("impactMedium")

                        navigation.navigate({
                            name: "TimelineScreens",
                            params: {
                                selectedDate: moment(new Date()).format("YYYY-MM-DD"),
                            },
                        })
                    }}
                    route="TimelineScreens"
                    label="Timeline"
                    iconName={"calendar-number"}
                />
            </BlurSurface>
        </Animated.View>
    )
}
