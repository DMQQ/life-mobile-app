import { AntDesign, Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import Color from "color"
import moment from "moment"
import { cloneElement, ReactNode, useEffect, useMemo } from "react"
import { Pressable, StyleSheet, TextInput, Keyboard } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Animated, {
    FadeInDown,
    FadeIn,
    interpolate,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
    useAnimatedKeyboard,
    useDerivedValue,
} from "react-native-reanimated"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { scheduleOnRN } from "react-native-worklets"
import Colors from "../../constants/Colors"
import Layout from "../../constants/Layout"
import GlassView from "../ui/GlassView"
import { useAppSelector, useAppDispatch } from "../../utils/redux"
import { setSearchActive, setSearchValue, clearSearch } from "../../utils/redux/search/search"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { useScrollYContext } from "@/utils/context/ScrollYContext"

const styles = StyleSheet.create({
    container: {
        width: Layout.screen.width,
        flexDirection: "row",
        position: "absolute",
        bottom: 20,
        height: 60,
        alignSelf: "center",
        paddingHorizontal: 15,
        left: 0,
    },
    button: {
        justifyContent: "center",
        alignItems: "center",
    },
    innerContainer: {
        flexDirection: "row",

        position: "relative",
        borderRadius: 100,
    },
    activeIndicator: {
        height: 40,
        borderRadius: 100,
        opacity: 1,
    },
})

const SearchButton = ({
    toggleSearch,
    isExpanded,
    value,
    onChangeText,
}: {
    toggleSearch: () => void
    isExpanded: boolean
    value: string
    onChangeText: (text: string) => void
}) => {
    const searchProgress = useSharedValue(0)

    useEffect(() => {
        searchProgress.value = withTiming(isExpanded ? 1 : 0, { duration: 300 })
    }, [isExpanded])

    const searchContainerStyle = useAnimatedStyle(() => {
        const width = interpolate(searchProgress.value, [0, 1], [60, Layout.screen.width - 30 - 70])

        return {
            width,
        }
    })

    const inputContainerStyle = useAnimatedStyle(() => ({
        opacity: searchProgress.value,
        width: interpolate(searchProgress.value, [0, 1], [0, Layout.screen.width - 30 - 70 - 60]),
    }))

    return (
        <Animated.View
            style={[
                {
                    position: "absolute",
                    right: 15,
                    height: 60,
                    justifyContent: "center",
                },
                searchContainerStyle,
            ]}
        >
            <GlassView style={{ height: 60, borderRadius: 100, flex: 1, flexDirection: "row", alignItems: "center" }}>
                {isExpanded && (
                    <Animated.View style={[{ flex: 1, paddingHorizontal: 15 }, inputContainerStyle]}>
                        <TextInput
                            value={value}
                            onChangeText={onChangeText}
                            style={{
                                color: Colors.foreground,
                                fontSize: 16,
                                paddingHorizontal: 10,
                                height: 40,
                                flex: 1,
                            }}
                            placeholder="Search..."
                            placeholderTextColor={Color(Colors.foreground).alpha(0.6).string()}
                            autoFocus={false}
                            returnKeyType="search"
                        />
                    </Animated.View>
                )}

                <Pressable
                    disabled={isExpanded}
                    style={{
                        width: 60,
                        height: 60,
                        justifyContent: "center",
                        alignItems: "center",
                        position: "absolute",
                        right: 0,
                    }}
                    onPress={toggleSearch}
                >
                    <AntDesign size={20} name="search" color="#fff" />
                </Pressable>
            </GlassView>
        </Animated.View>
    )
}

interface ButtonProps {
    route: string
    iconName: any
    label: string
    onLongPress?: any
    index: number

    iconScale: SharedValue<number>
    buttonWidth: number
    activeRoute: string
}

const gradient = [
    "transparent",
    Color(Colors.primary).alpha(0.15).toString(),
    Color(Colors.primary).alpha(0.5).toString(),
]

const Btn = ({ buttonWidth, iconScale, activeRoute, ...props }: ButtonProps) => {
    const isActive = activeRoute === props.route
    const pressScale = useSharedValue(1)

    const buttonAnimatedStyle = useAnimatedStyle(() => {
        const scale = isActive ? iconScale.value : pressScale.value
        return {
            transform: [{ scale }],
        }
    })

    const handlePressIn = (route: string) => {
        pressScale.value = withTiming(0.85, { duration: 100 })
        Feedback.trigger("impactLight", {
            enableVibrateFallback: false,
            ignoreAndroidSystemSettings: false,
        })

        navigation.navigate(route)
    }

    const handlePressOut = () => {
        pressScale.value = withSpring(1, {
            damping: 15,
            stiffness: 300,
        })
    }

    const navigation = useNavigation<any>()

    return (
        <Animated.View entering={FadeIn.delay(props.index * 50)}>
            <Pressable
                onPress={() => handlePressIn(props.route)}
                onPressOut={handlePressOut}
                onLongPress={props.onLongPress}
                style={[
                    {
                        width: buttonWidth,
                        justifyContent: "center",
                        alignItems: "center",
                        flex: 1,
                        height: 60,
                    },
                ]}
            >
                <Animated.View style={[buttonAnimatedStyle, { alignItems: "center", justifyContent: "center" }]}>
                    {typeof props.iconName === "string" ? (
                        <Ionicons
                            size={20}
                            name={props.iconName as any}
                            color={"#fff"}
                            style={{
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
                        cloneElement(props.iconName, {
                            style: {
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
                            },
                        })
                    )}
                </Animated.View>
            </Pressable>
        </Animated.View>
    )
}

export default function BottomTab({ navigation, state }: BottomTabBarProps) {
    const activeRoute = state.routes[state.index].name
    const routes = ["NotesScreens", "GoalsScreens", "Root", "WalletScreens", "TimelineScreens"]

    const handleLongPress = (route: string) => {
        switch (route) {
            case "WalletScreens":
                Feedback.trigger("impactMedium")
                navigation.navigate({
                    name: "WalletScreens",
                    params: {
                        expenseId: null,
                    },
                })
                break
            case "TimelineScreens":
                Feedback.trigger("impactMedium")
                navigation.navigate({
                    name: "TimelineScreens",
                    params: {
                        selectedDate: moment(new Date()).format("YYYY-MM-DD"),
                    },
                })
                break
            default:
                break
        }
    }

    const { scrollYValues } = useScrollYContext()

    const scrollY = useDerivedValue(() => {
        return scrollYValues.value[activeRoute] || 0
    }, [activeRoute])

    const dispatch = useAppDispatch()
    const { isActive: isSearchActive, value: searchValue } = useAppSelector((state) => state.search)

    const totalButtons = state.routes.length
    const buttonWidth = (Layout.screen.width - 30 - 70) / totalButtons

    const buttons = useMemo(
        () => [
            {
                route: "NotesScreens",
                label: "Notes",
                iconName: <MaterialCommunityIcons name="cards" size={20} color="#fff" />,
            },
            {
                route: "GoalsScreens",
                label: "Training",
                iconName: (
                    <Feather
                        name="target"
                        size={22.5}
                        color="#fff"
                        style={{ marginBottom: 2.5, paddingVertical: 7.5 }}
                    />
                ),
            },
            {
                route: "Root",
                label: "Home",
                iconName: "home",
            },
            {
                route: "WalletScreens",
                label: "Wallet",
                iconName: "wallet",
                onLongPress: () => handleLongPress("WalletScreens"),
            },
            {
                route: "TimelineScreens",
                label: "Timeline",
                iconName: "calendar-number",
                onLongPress: () => handleLongPress("TimelineScreens"),
            },
        ],
        [],
    )

    const indicatorPosition = useSharedValue(routes.indexOf(activeRoute))
    const iconScale = useSharedValue(1)
    const tabsOpacity = useSharedValue(1)
    const isDragging = useSharedValue(false)
    const dragScale = useSharedValue(1)
    const dragStartIndex = useSharedValue(0)

    const toggleSearch = () => {
        if (isSearchActive) {
            dispatch(clearSearch())
            Keyboard.dismiss()
        } else {
            dispatch(setSearchActive(true))
        }
        Feedback.trigger("impactMedium")
    }

    const handleSearchValueChange = (value: string) => {
        if (value !== searchValue) dispatch(setSearchValue(value))
    }

    useEffect(() => {
        if (!isSearchActive) {
            dragScale.value = 1
            isDragging.value = false

            indicatorPosition.value = withSpring(routes.indexOf(activeRoute), {
                damping: 25,
                stiffness: 200,
            })
            iconScale.value = withSequence(withTiming(0.9, { duration: 100 }), withTiming(1, { duration: 150 }))
        }
    }, [activeRoute, isSearchActive])

    useEffect(() => {
        tabsOpacity.value = withTiming(isSearchActive ? 0 : 1, { duration: isSearchActive ? 200 : 300 })
    }, [isSearchActive])

    const panGesture = Gesture.Pan()
        .onBegin(() => {
            "worklet"
            isDragging.value = true
            dragScale.value = withSpring(1.1, { damping: 20, stiffness: 300 })
            dragStartIndex.value = routes.indexOf(activeRoute)
        })
        .onUpdate((event) => {
            "worklet"

            const translation = event.translationX / buttonWidth
            const newPosition = dragStartIndex.value + translation
            const clampedPosition = Math.max(0, Math.min(routes.length - 1, newPosition))
            indicatorPosition.value = clampedPosition

            if (Math.abs(event.y) > 50) {
                scheduleOnRN(handleLongPress, activeRoute)
                dragScale.value = withSpring(1, { damping: 20, stiffness: 300 })
                isDragging.value = false
                indicatorPosition.value = withSpring(routes.indexOf(activeRoute), {
                    damping: 25,
                    stiffness: 200,
                })
            }
        })
        .onEnd((event) => {
            "worklet"
            const translation = event.translationX / buttonWidth
            const finalPosition = dragStartIndex.value + translation
            const targetIndex = Math.round(Math.max(0, Math.min(routes.length - 1, finalPosition)))
            const currentActiveIndex = routes.indexOf(activeRoute)

            indicatorPosition.value = withSpring(targetIndex, {
                damping: 20,
                stiffness: 150,
            })

            dragScale.value = withSpring(1, { damping: 20, stiffness: 300 })
            isDragging.value = false

            if (targetIndex !== currentActiveIndex && routes[targetIndex]) {
                scheduleOnRN(navigation.navigate, routes[targetIndex] as any)
            }
        })

    const indicatorStyle = useAnimatedStyle(() => {
        "worklet"
        const baseTranslateX = indicatorPosition.value * buttonWidth + buttonWidth * 0.2

        return {
            transform: [
                {
                    translateX: baseTranslateX,
                },
                {
                    scale: dragScale.value,
                },
            ],
            width: buttonWidth * 0.6,
        }
    }, [buttonWidth])

    const tabBarWidthStyle = useAnimatedStyle(() => ({
        width: interpolate(tabsOpacity.value, [0, 1], [60, Layout.screen.width - 30 - 70]),
    }))

    const isOpenSubScreen = (state.routes[state.index].state?.index || 0) > 0

    const keyboard = useAnimatedKeyboard()

    const animatedStyle = useAnimatedStyle(() => {
        const hideOnKeyboard = (isOpenSubScreen || keyboard.height.value > 0) && !isSearchActive

        return {
            transform: [
                {
                    translateY: hideOnKeyboard
                        ? withTiming(100, { duration: 200 })
                        : isSearchActive
                          ? -keyboard.height.value
                          : withTiming(0, { duration: 200 }),
                },
            ],
        }
    }, [isOpenSubScreen, isSearchActive])

    const dismissIcon = useMemo(() => buttons.find((btn) => btn.route === activeRoute)?.iconName, [activeRoute])

    return (
        <>
            <Animated.View style={[animatedStyle, styles.container]} entering={FadeInDown} exiting={FadeInDown}>
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[tabBarWidthStyle, { height: 60 }]}>
                        <GlassView
                            style={[
                                styles.innerContainer,
                                {
                                    borderRadius: 100,
                                    flex: 1,
                                    height: 60,
                                },
                            ]}
                        >
                            {!isSearchActive && (
                                <Animated.View
                                    style={[indicatorStyle, styles.activeIndicator, { position: "absolute", top: 10 }]}
                                    entering={FadeIn.delay((routes.indexOf(activeRoute) + 1) * 50)}
                                >
                                    <Pressable style={{ flex: 1, height: "100%" }}>
                                        <GlassView
                                            glassEffectStyle="clear"
                                            tintColor={Colors.secondary}
                                            style={[styles.activeIndicator]}
                                        />
                                    </Pressable>
                                </Animated.View>
                            )}

                            {isSearchActive && (
                                <Animated.View
                                    entering={FadeIn.delay(150)}
                                    style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 60 }}
                                >
                                    <Pressable
                                        style={{
                                            flex: 1,
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                        onPress={toggleSearch}
                                    >
                                        {typeof dismissIcon === "string" ? (
                                            <Ionicons size={20} name={dismissIcon as any} color="#fff" />
                                        ) : (
                                            cloneElement(dismissIcon as any, { size: 20, color: "#fff" })
                                        )}
                                    </Pressable>
                                </Animated.View>
                            )}

                            {!isSearchActive && (
                                <Animated.View style={{ flexDirection: "row", flex: 1 }}>
                                    {buttons.map((button, index) => (
                                        <Btn
                                            key={button.route}
                                            index={index}
                                            route={button.route}
                                            label={button.label}
                                            iconName={button.iconName}
                                            onLongPress={button.onLongPress}
                                            iconScale={iconScale}
                                            buttonWidth={buttonWidth}
                                            activeRoute={activeRoute}
                                        />
                                    ))}
                                </Animated.View>
                            )}
                        </GlassView>
                    </Animated.View>
                </GestureDetector>

                <SearchButton
                    toggleSearch={toggleSearch}
                    isExpanded={isSearchActive}
                    value={searchValue}
                    onChangeText={handleSearchValueChange}
                />
            </Animated.View>
            <LinearGradient
                colors={gradient as any}
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 80,
                }}
                pointerEvents="none"
            />
        </>
    )
}
