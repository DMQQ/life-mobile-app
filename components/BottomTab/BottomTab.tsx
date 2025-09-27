import { Padding } from "@/constants/Values"
import { AntDesign, Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import Color from "color"
import moment from "moment"
import { useEffect, useState } from "react"
import { Platform, Pressable, StyleSheet, TextInput, Keyboard, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Animated, {
    FadeInDown,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import Colors from "../../constants/Colors"
import Layout from "../../constants/Layout"
import useKeyboard from "../../utils/hooks/useKeyboard"
import GlassView from "../ui/GlassView"
import { useAppSelector, useAppDispatch } from "../../utils/redux"
import { setSearchActive, setSearchValue, clearSearch } from "../../utils/redux/search/search"
import { GlassContainer } from "expo-glass-effect"

const styles = StyleSheet.create({
    container: {
        width: Layout.screen.width,
        flexDirection: "row",
        position: "absolute",
        bottom: 15,
        height: 70,
        alignSelf: "center",
        paddingHorizontal: 15,
        left: 0,
    },
    button: {
        padding: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    innerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        position: "relative",
        borderRadius: 40,
    },
    activeIndicator: {
        position: "absolute",
        top: 15,
        height: 40,
        borderRadius: 100,
        opacity: 1,
    },
})

const AnimatedGlassView = Animated.createAnimatedComponent(GlassView)

interface SearchButtonProps {
    toggleSearch: () => void

    buttonWidth: number
}

const BackToTabsButton = ({ onPress, buttonWidth }: { onPress: () => void; buttonWidth: number }) => {
    return (
        <GlassView
            style={{ borderRadius: 100, flex: 1, width: buttonWidth, justifyContent: "center", alignItems: "center" }}
        >
            <Pressable style={[styles.button, { justifyContent: "center", alignItems: "center" }]} onPress={onPress}>
                <AntDesign
                    size={20}
                    name="arrow-left"
                    color="#fff"
                    style={{
                        marginBottom: 2.5,
                        paddingVertical: 7.5,
                    }}
                />
            </Pressable>
        </GlassView>
    )
}

const SearchButton = ({
    toggleSearch,
    buttonWidth,
    isExpanded,
    value,
    onChangeText,
}: SearchButtonProps & {
    isExpanded: boolean
    value: string
    onChangeText: (text: string) => void
}) => {
    return (
        <Animated.View
            style={[
                {
                    position: "absolute",
                    right: 15,
                    height: 70,
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 15,
                },
            ]}
        >
            {isExpanded && (
                <View style={{ flexDirection: "row", gap: 10, flex: 1 }}>
                    <BackToTabsButton buttonWidth={70} onPress={toggleSearch} />
                </View>
            )}
            <GlassView style={{ height: 70, borderRadius: 100 }}>
                {isExpanded && (
                    <TextInput
                        value={value}
                        onChangeText={onChangeText}
                        style={{
                            color: Colors.foreground,
                            fontSize: 16,
                            paddingHorizontal: 20,
                            height: 70,
                            width: Layout.screen.width - 30 - 70 - 20,
                        }}
                        placeholder="Search..."
                        placeholderTextColor={Color(Colors.foreground).alpha(0.6).string()}
                        autoFocus
                        returnKeyType="search"
                    />
                )}
                <Pressable
                    style={{ flex: 1, justifyContent: "center", alignItems: "center", width: 70 }}
                    onPress={toggleSearch}
                >
                    <AntDesign size={20} name="search" color="#fff" />
                </Pressable>
            </GlassView>
        </Animated.View>
    )
}

export default function BottomTab({ navigation, state, insets }: BottomTabBarProps) {
    const navigate = (route: string) => navigation.navigate(route)
    const activeRoute = state.routes[state.index].name
    const routes = ["NotesScreens", "GoalsScreens", "Root", "WalletScreens", "TimelineScreens"]
    const activeIndex = routes.indexOf(activeRoute)

    const dispatch = useAppDispatch()
    const { isActive: isSearchActive, value: searchValue } = useAppSelector((state) => state.search)

    const totalButtons = state.routes.length + 1
    const buttonWidth = (Layout.screen.width - 30 - 15) / totalButtons

    const indicatorPosition = useSharedValue(activeIndex * buttonWidth)
    const iconScale = useSharedValue(1)

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
        dispatch(setSearchValue(value))
    }

    useEffect(() => {
        if (!isSearchActive) {
            indicatorPosition.value = withSpring(activeIndex * buttonWidth, {
                damping: 20,
                stiffness: 150,
            })

            iconScale.value = withSequence(withTiming(0.9, { duration: 100 }), withTiming(1, { duration: 150 }))
        }
    }, [activeRoute, isSearchActive])

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: indicatorPosition.value + buttonWidth * 0.2 }],
        width: buttonWidth * 0.6,
    }))

    const Btn = (props: { route: string; iconName: any; label: string; onLongPress?: any; index: number }) => {
        const isActive = activeRoute === props.route
        const pressScale = useSharedValue(1)

        const buttonAnimatedStyle = useAnimatedStyle(() => {
            const scale = isActive ? iconScale.value : pressScale.value
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

        const handlePressIn = () => {
            pressScale.value = withTiming(0.85, { duration: 100 })
            Feedback.trigger("impactLight", {
                enableVibrateFallback: false,
                ignoreAndroidSystemSettings: false,
            })
        }

        const handlePressOut = () => {
            pressScale.value = withSpring(1, {
                damping: 15,
                stiffness: 300,
            })
        }

        return (
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onLongPress={props.onLongPress}
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
                                color={"#fff"}
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
            </Pressable>
        )
    }

    const keyboard = useKeyboard()
    const isOpenSubScreen = (state.routes[state.index].state?.index || 0) > 0

    const animatedStyle = useAnimatedStyle(() => {
        const hideOnKeyboard = isOpenSubScreen || keyboard

        return {
            transform: [
                {
                    translateY: hideOnKeyboard ? withTiming(100, { duration: 200 }) : withTiming(0, { duration: 200 }),
                },
            ],
        }
    })

    return (
        <Animated.View
            style={[animatedStyle, styles.container]}
            entering={FadeInDown.duration(150)}
            exiting={FadeInDown.duration(150)}
        >
            <GlassView
                style={[
                    styles.innerContainer,
                    {
                        paddingBottom: Platform.OS === "android" ? Padding.s + insets.bottom : Padding.xl,
                        paddingTop: Platform.OS === "android" ? insets.bottom + Padding.s : Padding.s,
                    },
                ]}
            >
                {!isSearchActive && (
                    <AnimatedGlassView
                        glassEffectStyle="clear"
                        tintColor={Colors.secondary}
                        style={[styles.activeIndicator, indicatorStyle]}
                    />
                )}

                {!isSearchActive && (
                    <>
                        <Btn
                            index={0}
                            route="NotesScreens"
                            label="Notes"
                            iconName={<MaterialCommunityIcons name="cards" size={22.5} color="#fff" />}
                        />

                        <Btn
                            index={1}
                            route="GoalsScreens"
                            label="Training"
                            iconName={
                                <Feather
                                    name="target"
                                    size={22.5}
                                    color="#fff"
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
                    </>
                )}
            </GlassView>
            <SearchButton
                toggleSearch={toggleSearch}
                buttonWidth={buttonWidth}
                isExpanded={isSearchActive}
                value={searchValue}
                onChangeText={handleSearchValueChange}
            />
        </Animated.View>
    )
}
