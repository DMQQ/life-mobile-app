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
import ContextMenuView, { type ContextMenuAction } from "react-native-context-menu-view"
import { useSearchMenu, type SearchMenuItem } from "@/contexts/SearchMenuContext"

const styles = StyleSheet.create({
    container: {
        width: Layout.screen.width,
        flexDirection: "row",
        position: "absolute",
        bottom: 20,
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
        height: 60,
        borderRadius: 100,
    },
})

const convertMenuItemToAction = (item: SearchMenuItem): ContextMenuAction => {
    const action: ContextMenuAction = {
        title: item.checked ? `✓ ${item.title}` : item.title,
        systemIcon: item.systemImage,
    }

    if (item.destructive) {
        action.destructive = true
    }

    if (item.children && item.children.length > 0) {
        action.actions = item.children.map((child) => convertMenuItemToAction(child))
    }

    return action
}

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
    const { menuItems } = useSearchMenu()
    const hasMenu = menuItems.length > 0

    useEffect(() => {
        searchProgress.value = withTiming(isExpanded ? 1 : 0, { duration: 300 })
    }, [isExpanded])

    const searchContainerStyle = useAnimatedStyle(() => {
        const width = interpolate(searchProgress.value, [0, 1], [70, Layout.screen.width - 30 - 70])

        return {
            width,
            height: isExpanded ? withTiming(60, { duration: 150 }) : 70,
        }
    })

    const inputContainerStyle = useAnimatedStyle(() => ({
        opacity: searchProgress.value,
        width: interpolate(searchProgress.value, [0.01, 1], [0, Layout.screen.width - 30 - 80]),
    }))

    const glassWrapper = useAnimatedStyle(
        () => ({
            width: interpolate(searchProgress.value, [0, 1], [70, Layout.screen.width - 30 - 70]),
            height: isExpanded ? withTiming(60, { duration: 150 }) : 70,
        }),
        [isExpanded, keyboard],
    )

    const handleMenuPress = (e: any, menuItems: SearchMenuItem[]) => {
        const indexPath = e.nativeEvent.indexPath || [e.nativeEvent.index]

        let currentItem: SearchMenuItem | undefined = undefined
        let currentLevel = menuItems

        for (const index of indexPath) {
            currentItem = currentLevel[index]
            if (!currentItem) return
            if (currentItem.children && currentItem.children.length > 0) {
                currentLevel = currentItem.children
            }
        }

        if (currentItem?.onPress) {
            currentItem.onPress()
            Feedback.trigger("impactLight")
        }
    }

    return (
        <ContextMenuView
            actions={menuItems.map((item) => convertMenuItemToAction(item))}
            onPress={(e) => {
                handleMenuPress(e, menuItems)
            }}
            disabled={!hasMenu}
            style={{ position: "absolute", right: 15, bottom: 0 }}
            previewBackgroundColor="transparent"
        >
            <GlassView style={{ flex: 1, borderRadius: 100 }}>
                <Animated.View style={[searchContainerStyle]}>
                    <Animated.View style={glassWrapper}>
                        <View
                            style={{
                                flexDirection: "row",
                                height: "100%",
                                borderRadius: 100,
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
                                style={{
                                    width: 70,
                                    height: "100%",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    position: "absolute",
                                    right: 0,
                                    top: 0,
                                }}
                                onPress={isExpanded ? () => onChangeText("") : toggleSearch}
                            >
                                <SymbolView name="magnifyingglass" size={26} tintColor={"#fff"} weight="semibold" />
                            </Pressable>
                        </View>
                    </Animated.View>
                </Animated.View>
            </GlassView>
        </ContextMenuView>
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
    const dragScaleY = useSharedValue(1)
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
            dragScale.value = withSpring(1, { damping: 14, stiffness: 280 })
            dragScaleY.value = withSpring(1, { damping: 12, stiffness: 320 })
            isDragging.value = false

            indicatorPosition.value = withTiming(routes.indexOf(activeRoute))
            iconScale.value = withSequence(
                withSpring(0.85, { damping: 18, stiffness: 320 }),
                withSpring(1.05, { damping: 10, stiffness: 280 }),
                withSpring(1, { damping: 14, stiffness: 240 }),
            )
        }
    }, [activeRoute, isSearchActive])

    useEffect(() => {
        tabsOpacity.value = withTiming(isSearchActive ? 0 : 1, { duration: isSearchActive ? 200 : 300 })
    }, [isSearchActive])

    const panGesture = Gesture.Pan()
        .onBegin(() => {
            "worklet"
            isDragging.value = true
            dragScale.value = withSpring(1.15, { damping: 14, stiffness: 320 })
            dragScaleY.value = withSpring(1.2, { damping: 12, stiffness: 360 })
            dragStartIndex.value = routes.indexOf(activeRoute)
        })
        .onUpdate((event) => {
            "worklet"

            const translation = event.translationX / buttonWidth
            const newPosition = dragStartIndex.value + translation
            const clampedPosition = Math.max(0, Math.min(routes.length - 1, newPosition))
            indicatorPosition.value = clampedPosition

            if (Math.abs(event.y) > 50) {
                const draggedToIndex = Math.round(clampedPosition)
                const draggedToRoute = routes[draggedToIndex]

                dragScale.value = withSpring(1, { damping: 14, stiffness: 280 })
                dragScaleY.value = withSpring(1, { damping: 12, stiffness: 320 })
                isDragging.value = false
                indicatorPosition.value = withTiming(routes.indexOf(activeRoute))

                scheduleOnRN(handleLongPress, draggedToRoute)
            }
        })
        .onEnd((event) => {
            "worklet"
            const translation = event.translationX / buttonWidth
            const finalPosition = dragStartIndex.value + translation
            const targetIndex = Math.round(Math.max(0, Math.min(routes.length - 1, finalPosition)))
            const currentActiveIndex = routes.indexOf(activeRoute)

            indicatorPosition.value = withTiming(targetIndex)

            dragScale.value = withSpring(1, { damping: 14, stiffness: 280 })
            dragScaleY.value = withSpring(1, { damping: 12, stiffness: 320 })
            isDragging.value = false

            if (targetIndex !== currentActiveIndex && routes[targetIndex]) {
                scheduleOnRN(navigation.navigate, routes[targetIndex] as any)
            }
        })

    const indicatorStyle = useAnimatedStyle(() => {
        "worklet"
        const indicatorWidth = Math.min(buttonWidth * 1.175, 85)
        const containerPadding = 5
        const baseTranslateX =
            indicatorPosition.value * buttonWidth + (buttonWidth - indicatorWidth) / 2 + containerPadding

        const containerWidth = Layout.screen.width - 30 - 70 - 15
        const maxTranslateX = containerWidth - indicatorWidth

        // For edge tabs, allow indicator to fill to the edges
        const isFirstTab = indicatorPosition.value < 0.5
        const isLastTab = indicatorPosition.value > routes.length - 1.5

        const minTranslateX = isFirstTab ? 0 : containerPadding
        const adjustedMaxTranslateX = isLastTab ? containerWidth - indicatorWidth : maxTranslateX - containerPadding

        return {
            transform: [
                {
                    translateX: Math.max(minTranslateX, Math.min(baseTranslateX, adjustedMaxTranslateX)),
                },
                {
                    scaleX: dragScale.value,
                },
                {
                    scaleY: dragScaleY.value,
                },
            ],
            width: indicatorWidth,
        }
    }, [buttonWidth])

    const tabBarWidthStyle = useAnimatedStyle(
        () => ({
            width: interpolate(tabsOpacity.value, [0, 1], [60, Layout.screen.width - 30 - 70 - 15]),
            height: isSearchActive ? 60 : 70,
        }),
        [isSearchActive],
    )

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
                    <Animated.View
                        style={[
                            tabBarWidthStyle,
                            {
                                borderRadius: 100,
                            },
                        ]}
                    >
                        <GlassView
                            style={[
                                styles.innerContainer,
                                {
                                    borderRadius: 100,
                                    flex: 1,
                                },
                            ]}
                        >
                            {!isSearchActive && showIndicator && (
                                <Animated.View
                                    style={[
                                        indicatorStyle,
                                        {
                                            position: "absolute",
                                            top: 5,
                                            height: 60,
                                            borderRadius: 100,
                                        },
                                    ]}
                                    entering={FadeIn.delay((routes.indexOf(activeRoute) + 1) * 50)}
                                >
                                    <View
                                        style={[
                                            styles.activeIndicator,
                                            { backgroundColor: Color(Colors.secondary).alpha(0.15).hex() },
                                        ]}
                                    />
                                </Animated.View>
                            )}

                            {isSearchActive && (
                                <Animated.View
                                    entering={FadeIn.delay(150)}
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: isSearchActive ? 60 : 70,
                                    }}
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
