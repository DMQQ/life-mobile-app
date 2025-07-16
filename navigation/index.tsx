import NotesScreens from "@/features/flashcards/Main"
import useDeeplinking from "@/utils/hooks/useDeeplinking"
import useQuickActions from "@/utils/hooks/useQuickActions"
import { useApolloClient } from "@apollo/client"
import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { DarkTheme, NavigationContainer, NavigationContainerRef } from "@react-navigation/native"
import React, { useCallback, useEffect } from "react"
import BottomTab from "../components/BottomTab/BottomTab"
import Colors from "../constants/Colors"
import Authentication from "../features/authentication/Main"
import GoalsScreens from "../features/goals/Main"
import Root from "../features/home/Root"
import TimelineScreens from "../features/timeline/Main"
import WalletScreens from "../features/wallet/Main"
import { RootStackParamList } from "../types"
import useNotifications from "../utils/hooks/useNotifications"
import useUser from "../utils/hooks/useUser"

export const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>()

const Tab = createBottomTabNavigator<RootStackParamList>()

export default function Navigation() {
    useQuickActions(navigationRef)
    const { isAuthenticated, loadUser, isLoading, removeUser } = useUser()
    const client = useApolloClient()
    const { sendTokenToServer } = useNotifications(navigationRef)

    useEffect(() => {
        loadUser()
    }, [])

    useEffect(() => {
        if (isAuthenticated) {
            sendTokenToServer().catch(async (err) => {
                const cause = err?.cause

                if (cause?.extensions?.response?.statusCode === 403) {
                    await client.resetStore()
                    await removeUser()
                }
            })
        }
    }, [isAuthenticated])

    const renderTab = useCallback(
        (props: BottomTabBarProps) => (isAuthenticated ? <BottomTab {...props} /> : null),
        [isAuthenticated],
    )

    const linking = useDeeplinking(navigationRef)

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
                },
            }}
        >
            <Tab.Navigator
                initialRouteName={isLoading ? "Loader" : "Root"}
                tabBar={renderTab}
                screenOptions={{
                    headerShown: false,
                    headerStyle: {
                        backgroundColor: Colors.primary,
                    },
                }}
            >
                {isAuthenticated ? (
                    <>
                        <Tab.Screen name="Root" component={Root} />

                        <Tab.Screen name="GoalsScreens" component={GoalsScreens} />

                        <Tab.Screen name="WalletScreens" component={WalletScreens as any} />

                        <Tab.Screen name="TimelineScreens" component={TimelineScreens} />

                        <Tab.Screen name="NotesScreens" component={NotesScreens} />
                    </>
                ) : (
                    <>
                        <Tab.Screen name="Authentication" component={Authentication} />
                    </>
                )}
            </Tab.Navigator>
        </NavigationContainer>
    )
}
