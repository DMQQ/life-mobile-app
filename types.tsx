/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { ParamListBase, RouteProp } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"

import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Icons } from "./features/wallet/components/Expense/ExpenseIcon"

export interface ScreenProps<Route extends keyof RootStackParamList> {
    navigation: NativeStackNavigationProp<RootStackParamList, Route>
    route: RouteProp<RootStackParamList, Route>
}

export interface StackScreenProps<T extends ParamListBase, Route extends keyof T> {
    navigation: NativeStackNavigationProp<T, Route>
    route: RouteProp<T, Route>
}

export type RootStackParamList = {
    Loader?: undefined

    DEFAULT: any

    Root: undefined

    Chat: undefined

    GoalsScreens: undefined

    Authentication: undefined

    WorkoutScreens: undefined

    TimelineScreens: any

    WalletScreens: undefined

    ImagesPreview: { uri: string }

    NotesScreens: undefined

    Settings: undefined
}

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
    RootStackParamList,
    Screen
>

export interface Workout {
    workoutId: string
    title: string
    description: string
    type: string
    difficulty: string

    exercises: Exercise[]
}

export interface Exercise {
    exerciseId: string
    title: string
    description: string
    difficulty: "Beginner" | "Intermediate" | "Advanced"
    muscleGroup: string
    equipment: string
    image: string
    tips: {
        tipId: string
        text: string
        image: string
    }[]
}

export interface ExerciseProgress {
    exerciseProgressId: string
    exerciseId: string
    reps: number
    weight: number
    sets: number
    date: string
}

export interface MonthlyFlow {
    income: number
    expense: number
}

export interface MonthlyExpenses {
    month: string
    flow: MonthlyFlow
    expenses: Expense[]
}

export interface Wallet {
    id: string
    balance: number
    income?: number
    monthlyPercentageTarget?: number
    expenses?: Expense[]
    expenses2: MonthlyExpenses[]
    subAccounts?: SubAccount[]
}

export interface SubAccount {
    id: string
    name: string
    description?: string | null
    color?: string | null
    icon?: string | null
    balance: number
    isDefault: boolean
    income?: number | null
    expense?: number | null
}

export interface Subscription {
    id: string
    isActive: boolean
    nextBillingDate: string
    dateStart: string
    dateEnd?: string | null

    description: string
    amount: number

    billingCycle: "monthly" | "yearly" | "weekly" | "daily" | "custom"
    billingDay?: number | null
    customBillingMonths?: number[] | null
    reminderDaysBeforehand?: number | null

    expenses: Expense[]
    totalSpent?: number
    totalAmount?: number
    totalDuration?: number
    walletId?: string
}

export interface Expense {
    id: string
    amount: number
    description: string
    date: string
    type: string
    balanceBeforeInteraction?: number | null
    category?: string | null

    spontaneousRate?: number | null

    subAccountId?: string | null

    subscription?: Subscription | null

    location?: { id: string; kind: string; name: string; latitude: number; longitude: number } | null

    subexpenses?: {
        id: string
        amount: number
        description: string
        category: string
    }[]

    files?:
        | {
              id: string
              url: string
              expenseId: string | undefined
          }[]
        | null

    note?: string | null

    tags?: string | null

    shop?: string | null

    shopEntityId?: string | null

    shopEntity?: { id: string; name: string; image?: string | null } | null

    walletId?: string
    schedule?: boolean
}

export interface Timeline {
    id: string
    title: string
    description: string
    userId: string | null | undefined
    date: string
    beginTime: string
    endTime: string
    isCompleted: boolean
    tags: string

    files: IFile[]

    todos: Todos[]
}

export interface CopyTimelineInput {
    newDate?: string
}

export interface CopyTimelineVariables {
    timelineId: string
    newDate?: string
}

export interface Todos {
    id: string
    title: string
    isCompleted: boolean

    createdAt: string

    modifiedAt: string

    finishedAt: string | null

    files?: TodoFile[]
}

export interface TodoFile {
    id: string
    type: string
    url: string
}

export interface IFile {
    id: string
    url: string
    timelineId: string | undefined
}
