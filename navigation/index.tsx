import { createNativeBottomTabNavigator } from "@react-navigation/bottom-tabs/unstable"
import { DarkTheme, getFocusedRouteNameFromRoute, NavigationContainer, LinkingOptions } from "@react-navigation/native"
import Colors from "../constants/Colors"
import Authentication from "../features/authentication/Main"
import GoalsScreens from "../features/goals/Main"
import HomeScreens from "../features/home/Main"
import TimelineScreens from "../features/timeline/Main"
import WalletScreens from "../features/wallet/Main"
import AiScreens from "../features/ai/Main"
import { RootStackParamList } from "../types"
import { navigationRef } from "./ref"

export { navigationRef } from "./ref"

const TAB_ROOT_SCREENS = new Set(["HomeRoot", "Goals", "Wallet", "Timeline", "AiWidget"])

const Tab = createNativeBottomTabNavigator()

interface NavigationProps {
    isAuthenticated: boolean
    isLoading: boolean
    linking: LinkingOptions<RootStackParamList>
}

export default function Navigation({ isAuthenticated, isLoading, linking }: NavigationProps) {
    if (isLoading) return null

    return (
        <NavigationContainer
            ref={navigationRef}
            linking={linking}
            theme={{
                ...DarkTheme,
                colors: {
                    ...DarkTheme.colors,
                    background: Colors.primary,
                    primary: Colors.secondary,
                    card: Colors.primary_lighter,
                    text: Colors.text_light,
                    border: Colors.borderColor,
                    notification: Colors.primary_dark,
                },
                dark: true,
            }}
        >
            <Tab.Navigator
                initialRouteName={isAuthenticated ? "Root" : "Authentication"}
                screenOptions={({ route }) => {
                    const focusedRoute = getFocusedRouteNameFromRoute(route)
                    const hideTabBar = focusedRoute !== undefined && !TAB_ROOT_SCREENS.has(focusedRoute)
                    return {
                        lazy: false,
                        tabBarActiveTintColor: Colors.secondary,
                        tabBarStyle: {
                            backgroundColor: Colors.primary,
                            display: hideTabBar ? "none" : "flex",
                        },
                        tabBarLabel: "",
                        tabBarLabelVisibilityMode: "unlabeled",
                        tabBarBlurEffect: "dark",
                    }
                }}
            >
                {isAuthenticated ? (
                    <>
                        <Tab.Screen
                            name="Root"
                            component={HomeScreens}
                            options={{
                                tabBarIcon: ({ focused }: { focused: boolean }) => ({
                                    type: "sfSymbol" as const,
                                    name: focused ? "house.fill" : "house",
                                }),
                            }}
                        />
                        <Tab.Screen
                            name="GoalsScreens"
                            component={GoalsScreens}
                            options={{
                                tabBarIcon: ({ focused }: { focused: boolean }) => ({
                                    type: "sfSymbol" as const,
                                    name: focused ? "target" : "target",
                                }),
                            }}
                        />
                        <Tab.Screen
                            name="AiScreens"
                            component={AiScreens}
                            options={{
                                tabBarInactiveTintColor: Colors.text_light,
                                tabBarIcon: ({ focused }: { focused: boolean }) => ({
                                    type: "sfSymbol" as const,
                                    name: focused ? "sparkles" : "sparkles",
                                }),
                                tabBarSystemItem: "search",
                                tabBarActiveIndicatorColor: Colors.secondary,
                                tabBarActiveTintColor: Colors.secondary,
                                tabBarActiveIndicatorEnabled: true,
                            }}
                        />
                        <Tab.Screen
                            name="WalletScreens"
                            component={WalletScreens as any}
                            options={{
                                tabBarIcon: ({ focused }: { focused: boolean }) => ({
                                    type: "sfSymbol" as const,
                                    name: focused ? "creditcard.fill" : "creditcard",
                                }),
                            }}
                        />
                        <Tab.Screen
                            name="TimelineScreens"
                            component={TimelineScreens}
                            options={{
                                tabBarIcon: ({ focused }: { focused: boolean }) => ({
                                    type: "sfSymbol" as const,
                                    name: focused ? "calendar.circle.fill" : "calendar",
                                }),
                            }}
                        />
                    </>
                ) : (
                    <Tab.Screen name="Authentication" component={Authentication} />
                )}
            </Tab.Navigator>
        </NavigationContainer>
    )
}
