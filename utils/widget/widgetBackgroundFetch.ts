import * as BackgroundFetch from "expo-background-fetch"
import * as SecureStore from "expo-secure-store"
import * as TaskManager from "expo-task-manager"
import { ExtensionStorage } from "@bacons/apple-targets"
import moment from "moment"
import Url from "@/constants/Url"
import store from "./store"
import type { WidgetTimelineData, WidgetTimelineEvent, WidgetTodo, WidgetWalletData, WidgetExpense } from "./types"

export const WIDGET_BG_FETCH_TASK = "WIDGET_BACKGROUND_FETCH"

const AUTH_KEY = "user"

async function getAuthToken(): Promise<string | null> {
    try {
        const raw = await SecureStore.getItemAsync(AUTH_KEY)
        if (!raw) return null
        return JSON.parse(raw)?.token ?? null
    } catch {
        return null
    }
}

async function gql<T>(query: string, variables: Record<string, unknown>, token: string): Promise<T | null> {
    try {
        const res = await fetch(`${Url.API}/graphql`, {
            method: "POST",
            headers: { "Content-Type": "application/json", authentication: token },
            body: JSON.stringify({ query, variables }),
        })
        const json = await res.json()
        return (json.data as T) ?? null
    } catch {
        return null
    }
}

const TIMELINE_QUERY = `
    query WidgetBgTimeline($date: String, $endDate: String) {
        occurrences(date: $date, endDate: $endDate) {
            id date title description beginTime endTime
            isCompleted isRepeat priority
            todos { id title isCompleted modifiedAt }
        }
    }
`

const WALLET_QUERY = `
    query WidgetBgWallet {
        wallet {
            balance income monthlyPercentageTarget
            expenses2(take: 1, skip: 0) {
                expenses {
                    id amount description date type category
                }
            }
        }
    }
`

function buildTimelineData(occurrences: any[], today: string): WidgetTimelineData {
    const sorted = [...occurrences].sort((a, b) => {
        return moment(`${a.date} ${a.beginTime}`).valueOf() - moment(`${b.date} ${b.beginTime}`).valueOf()
    })

    const events: WidgetTimelineEvent[] = sorted.slice(0, 8).map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description ?? "",
        date: e.date,
        beginTime: e.beginTime,
        endTime: e.endTime,
        isCompleted: e.isCompleted,
        isRepeat: e.isRepeat,
        todos: (e.todos ?? []).map((t: any): WidgetTodo => ({
            id: t.id,
            title: t.title,
            isCompleted: t.isCompleted,
            modifiedAt: t.modifiedAt,
        })),
    }))

    return {
        events,
        selectedDate: today,
        totalEvents: occurrences.length,
        completedEvents: occurrences.filter((e) => e.isCompleted).length,
        lastUpdated: new Date().toISOString(),
    }
}

function buildWalletData(wallet: any): WidgetWalletData {
    const recentExpenses: WidgetExpense[] = wallet.expenses2
        ?.flatMap((m: any) => m.expenses as any[])
        .slice(0, 5)
        .map((e: any): WidgetExpense => ({
            id: e.id,
            amount: e.amount,
            description: e.description.charAt(0).toUpperCase() + e.description.slice(1),
            date: e.date,
            type: e.type,
            category: e.category?.includes(":") ? e.category.split(":")[1].trim() : e.category ?? "none",
        })) ?? []

    return {
        balance: wallet.balance,
        income: wallet.income || 0,
        monthlyPercentageTarget: wallet.monthlyPercentageTarget || 0,
        recentExpenses,
        lastUpdated: new Date().toISOString(),
    }
}

TaskManager.defineTask(WIDGET_BG_FETCH_TASK, async () => {
    const token = await getAuthToken()
    if (!token) return BackgroundFetch.BackgroundFetchResult.NoData

    const today = moment().format("YYYY-MM-DD")
    const endDate = moment().add(2, "days").format("YYYY-MM-DD")

    const [timelineResult, walletResult] = await Promise.allSettled([
        gql<{ occurrences: any[] }>(TIMELINE_QUERY, { date: today, endDate }, token),
        gql<{ wallet: any }>(WALLET_QUERY, {}, token),
    ])

    let hasNewData = false

    if (timelineResult.status === "fulfilled" && timelineResult.value?.occurrences) {
        store.set("timeline_data", JSON.stringify(buildTimelineData(timelineResult.value.occurrences, today)))
        hasNewData = true
    }

    if (walletResult.status === "fulfilled" && walletResult.value?.wallet) {
        store.set("wallet_data", JSON.stringify(buildWalletData(walletResult.value.wallet)))
        hasNewData = true
    }

    if (hasNewData) {
        ExtensionStorage.reloadWidget()
    }

    return hasNewData
        ? BackgroundFetch.BackgroundFetchResult.NewData
        : BackgroundFetch.BackgroundFetchResult.NoData
})

export async function registerWidgetBackgroundFetch(): Promise<void> {
    try {
        const status = await BackgroundFetch.getStatusAsync()
        if (
            status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
            status === BackgroundFetch.BackgroundFetchStatus.Denied
        ) {
            return
        }
        const isRegistered = await TaskManager.isTaskRegisteredAsync(WIDGET_BG_FETCH_TASK)
        if (!isRegistered) {
            await BackgroundFetch.registerTaskAsync(WIDGET_BG_FETCH_TASK, {
                minimumInterval: 15 * 60,
                stopOnTerminate: false,
                startOnBoot: true,
            })
        }
    } catch (err) {
        console.log("[WidgetBG] registration failed:", err)
    }
}
