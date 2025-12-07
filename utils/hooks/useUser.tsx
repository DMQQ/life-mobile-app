import { useDispatch } from "react-redux"
import { useAppSelector } from "../redux/index"
import * as SecureStore from "expo-secure-store"
import { userActions } from "../redux/user/user"
import { useApolloClient, useMutation, gql } from "@apollo/client"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import store from "../widget/store"

export const STORE_KEY = "user"

export default function useUser() {
    const dispatch = useDispatch()
    const user = useAppSelector((state) => state.user)
    const apollo = useApolloClient()

    async function loadUser() {
        const json = await SecureStore.getItemAsync(STORE_KEY)

        if (json) {
            const user = JSON.parse(json)
            dispatch(userActions.loadUser({ user: user.user, token: user.token }))

            store.set("auth_token", user.token)
        } else {
            dispatch(userActions.notSigned())
            await SplashScreen.hideAsync()
        }
    }

    async function removeUser() {
        dispatch(userActions.removeUser())

        await SecureStore.deleteItemAsync(STORE_KEY)
        await apollo.clearStore()
        await apollo.resetStore()

        // Clear shared UserDefaults for Watch app and other extensions
        store.remove("auth_token")
    }

    const [refreshToken] = useMutation(gql`
        mutation {
            refreshToken
        }
    `)

    useEffect(() => {
        if (user.isAuthenticated) {
            const refresh = async () => {
                const token = await SecureStore.getItemAsync(STORE_KEY)

                if (token) {
                    const { data } = await refreshToken()
                    const parsedToken = JSON.parse(token)
                    const newUser = { ...parsedToken, token: data.refreshToken }
                    await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(newUser))
                    dispatch(userActions.loadUser(newUser))

                    // Update shared UserDefaults for Watch app and other extensions
                    store.set("auth_token", data.refreshToken)
                }
            }
            refresh()
        }
    }, [user.isAuthenticated])

    async function saveUser(input: { user: any; token: string }) {
        await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(input))
        dispatch(userActions.loadUser(input))

        // Update shared UserDefaults for Watch app and other extensions
        store.set("auth_token", input.token)
    }

    return { ...user, loadUser, saveUser, removeUser }
}
