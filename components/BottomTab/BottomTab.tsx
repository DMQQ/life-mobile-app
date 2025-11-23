import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import Color from "color"
import moment from "moment"
import { useEffect, useMemo, useState } from "react"
import { Pressable, StyleSheet, TextInput, Keyboard, Text, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import { SymbolView } from "expo-symbols"
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
import useKeyboard from "@/utils/hooks/useKeyboard"

const styles = StyleSheet.create({
    container: {
        width: Layout.screen.width,
        flexDirection: "row",
        position: "absolute",
        bottom: 20,
        height: 70,
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
        height: 70,
        borderRadius: 100,
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
    const keyboard = useKeyboard()

    useEffect(() => {
        searchProgress.value = withTiming(isExpanded ? 1 : 0, { duration: 300 })
    }, [isExpanded])

    const searchContainerStyle = useAnimatedStyle(() => {
        const width = interpolate(searchProgress.value, [0, 1], [70, Layout.screen.width - 30 - 70])

        return {
            width,
        }
    })

    const inputContainerStyle = useAnimatedStyle(() => ({
        opacity: searchProgress.value,
        width: interpolate(searchProgress.value, [0, 1], [0, Layout.screen.width - 30 - 80 - 70]),
    }))

    const glassWrapper = useAnimatedStyle(
        () => ({
            width: interpolate(
                searchProgress.value,
                [0, 1],
                [70, Layout.screen.width - 30 - 70 - 15 - (isExpanded && keyboard ? 70 : 0)],
            ),
            paddingLeft: isExpanded ? 15 : 0,
        }),
        [isExpanded, keyboard],
    )

    return (
        <Animated.View
            style={[
                {
                    position: "absolute",
                    right: 15,
                    height: 70,
                    justifyContent: "center",
                },
                searchContainerStyle,
            ]}
        >
            <Animated.View style={glassWrapper}>
                <GlassView
                    style={{
                        height: 70,
                        borderRadius: 100,
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
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
                            width: 70,
                            height: 70,
                            justifyContent: "center",
                            alignItems: "center",
                            position: "absolute",
                            right: 0,
                        }}
                        onPress={toggleSearch}
                    >
                        <SymbolView name="magnifyingglass" size={26} tintColor={"#fff"} weight="semibold" />
                    </Pressable>
                </GlassView>
            </Animated.View>

            {isExpanded && keyboard && (
                <GlassView
                    style={{
                        alignItems: "center",
                        position: "absolute",
                        right: 0,
                        borderRadius: 100,
                        width: 70,
                        height: 70,
                        justifyContent: "center",
                    }}
                >
                    <Pressable
                        onPress={() => {
                            Keyboard.dismiss()
                            onChangeText("")
                            toggleSearch()
                        }}
                    >
                        <SymbolView name="xmark" size={26} tintColor={"#fff"} weight="semibold" />
                    </Pressable>
                </GlassView>
            )}
        </Animated.View>
    )
}

interface ButtonProps {
    route: string
    iconName: string
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
                        height: 70,
                        gap: 4,
                    },
                ]}
            >
                <Animated.View style={[buttonAnimatedStyle, { alignItems: "center", justifyContent: "center" }]}>
                    <SymbolView
                        name={props.iconName as any}
                        size={27.5}
                        tintColor={"#fff"}
                        weight="semibold"
                        style={{
                            width: 27.5,
                            height: 27.5,
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
                </Animated.View>
                <Text
                    style={{
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: isActive ? "600" : "400",
                        opacity: isActive ? 1 : 0.7,
                    }}
                >
                    {props.label}
                </Text>
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

    const dispatch = useAppDispatch()
    const { isActive: isSearchActive, value: searchValue } = useAppSelector((state) => state.search)

    const totalButtons = state.routes.length
    const buttonWidth = (Layout.screen.width - 30 - 70 - 15 - 10) / totalButtons

    const buttons = useMemo(
        () => [
            {
                route: "NotesScreens",
                label: "Notes",
                iconName: "rectangle.stack",
            },
            {
                route: "GoalsScreens",
                label: "Training",
                iconName: "scope",
            },
            {
                route: "Root",
                label: "Home",
                iconName: "house.fill",
            },
            {
                route: "WalletScreens",
                label: "Wallet",
                iconName: "creditcard.fill",
                onLongPress: () => handleLongPress("WalletScreens"),
            },
            {
                route: "TimelineScreens",
                label: "Timeline",
                iconName: "calendar",
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
        const indicatorWidth = Math.min(buttonWidth * 1.175, 85)
        const paddingOffset = 5
        const baseTranslateX =
            indicatorPosition.value * buttonWidth + (buttonWidth - indicatorWidth) / 2 + paddingOffset

        return {
            transform: [
                {
                    translateX: Math.max(
                        paddingOffset,
                        Math.min(baseTranslateX, Layout.screen.width - 30 - 70 - 15 - indicatorWidth - paddingOffset),
                    ),
                },
                {
                    scale: withSpring(Math.min(dragScale.value, 1.05), { damping: 20, stiffness: 200 }),
                },
            ],
            width: indicatorWidth,
        }
    }, [buttonWidth])

    const tabBarWidthStyle = useAnimatedStyle(() => ({
        width: interpolate(tabsOpacity.value, [0, 1], [70, Layout.screen.width - 30 - 70 - 15]),
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

    const [showIndicator, setShowIndicator] = useState(false)

    useEffect(() => {
        let timeout: NodeJS.Timeout

        if (!isSearchActive) {
            timeout = setTimeout(() => {
                setShowIndicator(true)
            }, 300)
        } else {
            setShowIndicator(false)
        }

        return () => {
            if (timeout) clearTimeout(timeout)
        }
    }, [isSearchActive])

    const dismissIcon = useMemo(() => buttons.find((btn) => btn.route === activeRoute)?.iconName, [activeRoute])

    return (
        <>
            <Animated.View style={[animatedStyle, styles.container]} entering={FadeInDown} exiting={FadeInDown}>
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[tabBarWidthStyle, { height: 70 }]}>
                        <GlassView
                            style={[
                                styles.innerContainer,
                                {
                                    borderRadius: 100,
                                    flex: 1,
                                    height: 70,
                                },
                            ]}
                        >
                            {!isSearchActive && showIndicator && (
                                <Animated.View
                                    style={[
                                        indicatorStyle,
                                        {
                                            position: "absolute",
                                            top: 0,
                                            height: 70,
                                            borderRadius: 100,
                                            overflow: "hidden",
                                        },
                                    ]}
                                    entering={FadeIn.delay((routes.indexOf(activeRoute) + 1) * 50)}
                                >
                                    <View style={[styles.activeIndicator, { backgroundColor: Colors.secondary }]} />
                                </Animated.View>
                            )}

                            {isSearchActive && (
                                <Animated.View
                                    entering={FadeIn.delay(150)}
                                    style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 70 }}
                                >
                                    <Pressable
                                        style={{
                                            flex: 1,
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                        onPress={toggleSearch}
                                    >
                                        <SymbolView
                                            name={(dismissIcon || "house.fill") as any}
                                            size={26}
                                            tintColor={"#fff"}
                                            weight="semibold"
                                        />
                                    </Pressable>
                                </Animated.View>
                            )}

                            {!isSearchActive && (
                                <Animated.View style={{ flexDirection: "row", flex: 1, paddingHorizontal: 5 }}>
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
