import { RootStackParamList } from "@/types"
import { getStateFromPath as defaultGetStateFromPath, LinkingOptions } from "@react-navigation/native"
import * as Linking from "expo-linking"
import { useMemo } from "react"

const prefix = Linking.createURL("/")

let pendingInitialUrl: ReturnType<typeof Linking.getInitialURL> | null = Linking.getInitialURL()

export default function useDeeplinking(): LinkingOptions<RootStackParamList> {
    return useMemo<LinkingOptions<RootStackParamList>>(
        () => ({
            prefixes: [prefix, "mylife://"],
            config: {
                screens: {
                    WalletScreens: {
                        path: "wallet",
                        initialRouteName: "Wallet",
                        screens: {
                            Wallet: "",
                            Charts: "charts",
                        },
                    },
                    TimelineScreens: {
                        path: "timeline",
                        initialRouteName: "Timeline",
                        screens: {
                            Timeline: "",
                            TimelineCreate: "create",
                            TimelineDetails: "id/:timelineId",
                        },
                    },
                },
            } as any,
            getStateFromPath(path, options) {
                // Modal screens can't be pushed until the parent stack is mounted.
                // Set tab-level params instead — the useEffect in wallet/Main.tsx
                // opens CreateExpense imperatively once Wallet is rendered.
                if (/^wallet\/create-expense/.test(path)) {
                    return { routes: [{ name: "WalletScreens", params: { expenseId: null } }] }
                }
                // Wallet screen finds the full expense object from loaded data,
                // then navigates to Expense — can't skip directly to Expense.
                const expenseMatch = path.match(/^wallet\/expense\/id\/([^/?]+)/)
                if (expenseMatch) {
                    return {
                        routes: [
                            {
                                name: "WalletScreens",
                                state: {
                                    index: 1,
                                    routes: [
                                        { name: "Wallet" },
                                        { name: "Expense", params: { expenseId: expenseMatch[1] } },
                                    ],
                                },
                            },
                        ],
                    }
                }
                return defaultGetStateFromPath(path, options)
            },
            getInitialURL: async () => {
                const url = await pendingInitialUrl
                pendingInitialUrl = null
                return url
            },
            subscribe(listener) {
                const sub = Linking.addEventListener("url", ({ url }) => listener(url))
                return () => sub.remove()
            },
        }),
        [],
    )
}
