# Expo Router Migration Guide

This document captures the complete navigation architecture of the app before migrating from raw React Navigation (`@react-navigation/native`) to Expo Router (file-based routing). Use this as the source of truth during the migration to ensure nothing is lost.

---

## Table of Contents

1. [Current Architecture Overview](#1-current-architecture-overview)
2. [App Entry Point](#2-app-entry-point)
3. [Root Navigation (Tab Navigator)](#3-root-navigation-tab-navigator)
4. [Feature Stacks (Screens)](#4-feature-stacks-screens)
5. [Screen-by-Screen Inventory](#5-screen-by-screen-inventory)
6. [Deep Linking Configuration](#6-deep-linking-configuration)
7. [Notification-Driven Navigation](#7-notification-driven-navigation)
8. [Quick Actions Navigation](#8-quick-actions-navigation)
9. [Custom Tab Bar Component](#9-custom-tab-bar-component)
10. [Live Activity Deep Links](#10-live-activity-deep-links)
11. [Navigation Hooks & Utilities](#11-navigation-hooks--utilities)
12. [External Navigation (navigationRef)](#12-external-navigation-navigationref)
13. [Dependencies to Replace/Keep](#13-dependencies-to-replacereplace)
14. [app.json Configuration](#14-appjson-configuration)

---

## 1. Current Architecture Overview

### Pattern: Nested Stack inside Bottom Tab

```
NavigationContainer
  └── Tab.Navigator (BottomTabNavigator)
      ├── [auth] Tab: Root         → HomeScreens (NativeStack)
      │                               ├── Root
      │                               ├── HomeNotifications (modal)
      │                               └── HomeSettings (modal)
      ├── [auth] Tab: GoalsScreens  → GoalsScreens (NativeStack)
      │                               ├── Goals
      │                               ├── CreateGoal (modal)
      │                               ├── Goal
      │                               ├── UpdateGoalEntry (modal)
      │                               └── IconPicker (modal)
      ├── [auth] Tab: WalletScreens → WalletScreens (NativeStack)
      │                               ├── Wallet
      │                               ├── CreateExpense (modal)
      │                               ├── Expense
      │                               ├── Charts
      │                               ├── Filters (modal)
      │                               ├── Subscription
      │                               ├── EditSubscription (modal)
      │                               ├── EditBalance (modal)
      │                               ├── SpendingLimits → nested Navigator
      │                               ├── CorrectionMaps → nested Navigator
      │                               ├── CreateSubAccount (modal)
      │                               ├── TransferSubAccount (modal)
      │                               ├── ExpensesList
      │                               └── SubscriptionsList
      ├── [auth] Tab: TimelineScreens → TimelineScreens (NativeStack)
      │                                 ├── Timeline
      │                                 ├── TimelineDetails
      │                                 ├── TimelineCreate (modal)
      │                                 ├── ImagesPreview (transparentModal, fade)
      │                                 ├── CreateTimelineTodos (modal)
      │                                 ├── TodosTransferModal (modal)
      │                                 ├── CopyTimelineModal (modal)
      │                                 ├── MissedEventsModal (modal)
      │                                 └── TimelineDo (modal)
      └── [!auth] Tab: Authentication → AuthenticationScreens (NativeStack)
                                          ├── Landing
                                          ├── Login
                                          └── Register
```

### Other features (reachable but not tabbed):
- **WorkoutScreens** → defined in `RootStackParamList` but no tab — navigated programmatically
- **NotesScreens** (Flashcards) → defined in `RootStackParamList` but no tab — navigated programmatically
- **Chat** → defined in `RootStackParamList` but not in tab navigator
- **WorkoutScreens** → defined in `RootStackParamList` but not in tab navigator

### Key file: `navigation/index.tsx`
- Exports `navigationRef` (global ref) and `Navigation()` component
- Renders conditional auth-based tabs
- Custom tab bar (`BottomTab`) only shown when authenticated (null when !auth)
- Passes `linking` config from `useDeeplinking` to `NavigationContainer`

---

## 2. App Entry Point

**File:** `App.tsx` (118 lines)

Provider tree (outermost → innermost):

```tsx
<SafeAreaProvider>
  <ErrorBoundary>
    <KeyboardProvider>
      <GestureHandlerRootView>
        <BottomSheetModalProvider>
          <ThemeContextProvider>
            <ScrollYContextProvider>
              <SearchMenuProvider>
                <ApolloProvider client={apolloClient}>
                  <Provider store={store}>
                    <AiChatProvider>
                      <StatusBar />
                      <Navigation />           {/* <-- navigation goes here */}
                      <GlobalAiChat />          {/* AI chat overlay */}
                    </AiChatProvider>
                  </Provider>
                </ApolloProvider>
              </SearchMenuProvider>
            </ScrollYContextProvider>
          </ThemeContextProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </KeyboardProvider>
  </ErrorBoundary>
</SafeAreaProvider>
```

### Sentinel/Sentry setup:
```ts
Sentry.init({ enableNative: true, attachScreenshot: true, enableAutoPerformanceTracing: true, attachViewHierarchy: true })
export default Sentry.wrap(function App() { ... })
```

### Splash screen:
```ts
SplashScreen.preventAutoHideAsync()
SplashScreen.setOptions({ duration: 500, fade: true })
```

### Notifications handler (at module level):
```ts
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false, shouldSetBadge: false, shouldShowAlert: true,
    shouldShowBanner: true, shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
})
```

### Key imports used around navigation:
- `SafeAreaProvider` from `react-native-safe-area-context`
- `GestureHandlerRootView` from `react-native-gesture-handler`
- `BottomSheetModalProvider` from `@gorhom/bottom-sheet`

---

## 3. Root Navigation (Tab Navigator)

**File:** `navigation/index.tsx` (101 lines)

### Imports:
```ts
import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { DarkTheme, NavigationContainer, NavigationContainerRef } from "@react-navigation/native"
import BottomTab from "../components/BottomTab/BottomTab"
```

### Global navigation ref:
```ts
export const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>()
```

### Tab navigator:
```ts
const Tab = createBottomTabNavigator<RootStackParamList>()
```

### Auth-based conditional rendering:

```tsx
// Inside Navigation component:
const { isAuthenticated, loadUser, isLoading, removeUser } = useUser()
const client = useApolloClient()
const { sendTokenToServer } = useNotifications(navigationRef as any)

useQuickActions(navigationRef as any)
useActivityManager()
useWidgets()

// Loading screen — returns null (handled by splash maybe?)
if (isLoading) return null

// Linking config
const linking = useDeeplinking(navigationRef as any)

// Tab bar renderer (null when not authenticated)
const renderTab = useCallback(
  (props: BottomTabBarProps) => (isAuthenticated ? <BottomTab {...props} /> : null),
  [isAuthenticated],
)
```

### NavigationContainer theme override:
```tsx
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
    initialRouteName="Root"
    tabBar={renderTab}
    screenOptions={{
      headerShown: false,
      headerStyle: { backgroundColor: Colors.primary },
      lazy: false,
    }}
  >
    {isAuthenticated ? (
      <>
        <Tab.Screen name="Root" component={HomeScreens} />
        <Tab.Screen name="GoalsScreens" component={GoalsScreens} />
        <Tab.Screen name="WalletScreens" component={WalletScreens as any} />
        <Tab.Screen name="TimelineScreens" component={TimelineScreens} />
      </>
    ) : (
      <Tab.Screen name="Authentication" component={Authentication} />
    )}
  </Tab.Navigator>
</NavigationContainer>
```

### Exported navigationRef usage:
Used by components outside React Navigation context for imperative navigation:
- `components/ui/Button/IconBackButton.tsx` — `canGoBack()` / `goBack()`
- `features/timeline/components/TimelineItem.tsx` — `navigate("TimelineScreens", ...)`
- `features/timeline/components/WeekView.tsx`
- `features/timeline/components/MonthView.tsx`
- `features/wallet/components/Wallet/WalletItem.tsx`
- `features/wallet/components/AiChat/SkillCard.tsx`

---

## 4. Feature Stacks (Screen-by-Screen)

### 4a. Home Stack

**File:** `features/home/Main.tsx`

**Stack type:** `HomeRootStack extends ParamListBase`
```ts
{
  Root: undefined,
  HomeNotifications: undefined,
  HomeSettings: undefined,
}
```

**Exported type:** `HomeScreenProps<Screen extends keyof HomeRootStack> = StackScreenProps<HomeRootStack, Screen>`

**Screens:**

| Route             | Component          | Options                 | initialRouteName |
|-------------------|--------------------|-------------------------|------------------|
| `Root`            | `Root`             | default (headerShown:false) | ✅ |
| `HomeNotifications` | `NotificationsScreen` | `presentation: "modal"`, headerShown:false | |
| `HomeSettings`    | `SettingsScreen`   | `presentation: "modal"`, headerShown:false | |

**Wrapper:** `<RefreshContextProvider>` wraps the entire stack navigator.

**Export:** `export default HomeScreens` (no props).

---

### 4b. Goals Stack

**File:** `features/goals/Main.tsx`

**Stack type:** untyped (`createNativeStackNavigator()`)

**Screens:**

| Route             | Component    | Options                                          | Notes |
|-------------------|-------------|--------------------------------------------------|-------|
| `Goals`           | `Goals`     | `headerShown: false`                              | initialRouteName |
| `CreateGoal`      | `CreateGoal` | `presentation: "modal"`, title:"Create Goal"     | |
| `Goal`            | `Goal`      | `headerShown: false`                              | |
| `UpdateGoalEntry` | `UpdateGoalEntry` | `presentation: "modal"`, title:"Update Goal Entry" | |
| `IconPicker`      | `IconPicker` | `presentation: "modal"`, title:"Icon Picker"      | |

**screenOptions:** `{ headerShown: false }`

**Export:** `export default Main`

---

### 4c. Wallet Stack

**File:** `features/wallet/Main.tsx`

**Stack type:** `WalletRootStack extends ParamListBase`
```ts
{
  Wallet: { expenseId?: string }
  Watchlist: undefined
  Charts: undefined
  EditBalance: undefined
  SpendingLimits: undefined
  CorrectionMaps: { prefill?: { shop?: string; description?: string; category?: string; amount?: number } } | undefined
  CorrectionMapForm: { prefill?: {...}; editingItem?: CorrectionMap } | undefined
  AiStatsChat: { startDate: string; endDate: string }
  CreateSubAccount: { editSubAccount?: { id: string; name: string; description: string | null; color: string; icon: string; balance: number } } | undefined
  TransferSubAccount: { fromId?: string } | undefined
  ExpensesList: undefined
  SubscriptionsList: undefined
}
```

**Exported type:** `WalletScreens<Screen> = StackScreenProps<WalletRootStack, Screen>`

**Screens (note: CreateExpense is a stack screen here, not in the type):**

| Route              | Component           | Options                       | initialParams                                  | Notes |
|--------------------|--------------------|-------------------------------|------------------------------------------------|-------|
| `Wallet`           | `WalletScreen`     | default                       |                                                | initialRouteName |
| `CreateExpense`    | `CreateExpenseModal` | `presentation: "modal"`, headerShown:false | `{type:null, amount:0, category:"", date:"", description:"", shouldOpenPhotoPicker:false, isEditing:false}` | |
| `Expense`          | `Expense`          | `headerShown: false`           |                                                | |
| `Charts`           | `WalletCharts`     | `headerShown: false`           |                                                | |
| `Filters`          | `ExpenseFiltersSheet` | `presentation: "modal"`       |                                                | |
| `Subscription`     | `SubscriptionDetails` | default                      |                                                | typed as `any` |
| `EditSubscription` | `EditSubscription` | `presentation: "modal"`        |                                                | typed as `any` |
| `EditBalance`      | `EditBalance`      | `presentation: "modal"`, header shown, title:"Edit balance" |                          | header visible |
| `SpendingLimits`   | `SpendingLimitsNavigator` | `presentation: "modal"` |                                        | nested navigator |
| `CorrectionMaps`   | (unnamed)         | `presentation: "modal"`        |                                                | nested navigator |
| `CreateSubAccount` | `CreateSubAccount` | `presentation: "modal"`        |                                                | |
| `TransferSubAccount` | `TransferSubAccount` | `presentation: "modal"`    |                                                | |
| `ExpensesList`     | `ExpensesListScreen` | default                      |                                                | |
| `SubscriptionsList` | `SubscriptionsListScreen` | default                   |                                                | |

**Wrapper:** `<WalletContextProvider>` wraps the entire stack navigator.

**Initialization logic (useEffect):**
```ts
if (route.params?.expenseId !== undefined && route.params?.expenseId == null) {
  navigation.navigate("CreateExpense", { ...(route.params || {}) })
}
```

**Export:** `export default function WalletScreens({ navigation, route }: WalletScreens<"Wallet">)`

---

### 4d. Wallet Sub-Stacks (Nested Navigators)

#### SpendingLimits

**File:** `features/wallet/pages/SpendingLimits/Main.tsx`

```ts
const Stack = createNativeStackNavigator<{ Index: undefined; Create: undefined }>()
```

| Route    | Component              | Options       |
|----------|------------------------|---------------|
| `Index`  | `SpendingLimitsIndex`  | title:"Spending Limits" |
| `Create` | `SpendingLimitsCreate` | title:"Create limit", headerBackTitle:"Limit" |

**screenOptions:** `{ headerStyle: { backgroundColor: Colors.primary }, headerTintColor: Colors.foreground }`
**Export:** `SpendingLimitsNavigator` (default)

#### CorrectionMaps

**File:** `features/wallet/pages/CorrectionMaps/Main.tsx`

```ts
const Stack = createNativeStackNavigator<{ Index: undefined; Create: {} }>()
```

| Route    | Component             | Options               |
|----------|-----------------------|-----------------------|
| `Index`  | `CorrectionMapsScreen` | title:"Correction maps" |
| `Create` | `CorrectionMapForm`   | headerBackTitle:"List" |

**screenOptions:** `{ headerStyle: { backgroundColor: Colors.primary } }`
**Export:** unnamed default export function

---

### 4e. Timeline Stack

**File:** `features/timeline/Main.tsx`

**Stack type:** `TimelineRootStack` (from `features/timeline/types.ts`)
```ts
{
  Timeline: undefined
  TimelineDetails: { timelineId: string }
  TimelineDo: { timelineId: string }
  TimelineCreate: {
    selectedDate: string
    mode: "create" | "edit" | "shopping-list"
    timelineId?: string; todos?: string[]; title?: string
    description?: string; beginTime?: string; endTime?: string
  }
  ImagesPreview: { selectedImage: string; timelineId: string }
  Schedule: { selected: string; selectedDate: string }
  Search: undefined
  CreateTimelineTodos: { timelineId?: string; mode?: "create" | "push-back"; todos: string[] }
  TodosTransferModal: { timelineId: string }
  CopyTimelineModal: { timelineId: string; timelineTitle: string; originalDate: string }
  MissedEventsModal: { eventIds: string[] }
}
```

**Exported type:** `TimelineScreenProps<Key extends keyof TimelineRootStack> = StackScreenProps<TimelineRootStack, Key>`

**Screens:**

| Route                | Component              | Options                                                     | initialParams                                |
|----------------------|------------------------|-------------------------------------------------------------|----------------------------------------------|
| `Timeline`           | `Timeline`             | `headerShown: false`                                        |                                              |
| `TimelineDetails`    | `TimelineDetails`      | `headerShown: false`                                        | `{timelineId: ""}`                           |
| `TimelineCreate`     | `CreateTimeLineEventModal` | `headerShown: false`, `presentation: "modal"`            | `{selectedDate: moment().format("YYYY-MM-DD"), mode: "create"}` |
| `ImagesPreview`      | `ImagesPreview`        | `headerTitle: ""`, `headerTransparent: true`, `presentation: "transparentModal"`, `animation: "fade"` | `{selectedImage: "", timelineId: ""}` |
| `CreateTimelineTodos` | `CreateTimelineTodos` | `headerShown: false`, `presentation: "modal"`, `contentStyle: { backgroundColor: Color(Colors.primary).alpha(0.5).string() }` | `{timelineId: ""}` |
| `TodosTransferModal` | `TodosTransferModal`   | `headerShown: false`, `presentation: "modal"`                |                                              |
| `CopyTimelineModal`  | `CopyTimelineModal`    | `headerShown: false`, `presentation: "modal"`                |                                              |
| `MissedEventsModal`  | `MissedEventsModal`    | `headerShown: true`, `presentation: "modal"`, `title:"Missed Events"`, custom headerLeft close button |            |
| `TimelineDo`         | `TimelineDoScreen`     | `headerShown: false`, `presentation: "modal"`                |                                              |

**screenOptions:** `{ gestureEnabled: Platform.OS === "ios", gestureDirection: "horizontal" }`

**Initialization logic (useEffect):**
```ts
if (route.params?.timelineId) {
  navigation.navigate("TimelineDetails", { ...route.params, timelineId: route.params.timelineId })
} else if (route.params?.selectedDate !== undefined) {
  navigation.navigate("TimelineCreate", { ...route.params })
}
```

**Note on Schedule & Search screens:** Defined in `TimelineRootStack` type but NOT registered in `Main.tsx` Stack.Navigator. These may be missing or defined elsewhere.

**Export:** `export default function TimelineScreens({ route, navigation }: RootStackScreenProps<"TimelineScreens">)`

---

### 4f. Workout Stack

**File:** `features/workout/Main.tsx`

**Stack type:** `WorkoutStackParamList extends ParamListBase`
```ts
{
  Exercise: { exerciseId: string }
  Workouts: undefined
  Workout: { workoutId: string }
  WorkoutCreate: undefined
  PendingWorkout: { workoutId: string; delayTimerStart?: number; exerciseId: string }
  WorkoutSummary?: { workoutId?: string }
}
```

**Exported type:** `WorkoutScreenProps<T extends keyof WorkoutStackParamList> = StackScreenProps<WorkoutStackParamList, T>`

**Screens:**

| Route           | Component        | Options                        | initialParams                          |
|-----------------|------------------|--------------------------------|----------------------------------------|
| `Workouts`      | `Workouts`       | `headerShown: false`            | initialRouteName (index)               |
| `Workout`       | `Workout`        | default                        |                                        |
| `Exercise`      | `ExerciseScreen` | default                        |                                        |
| `WorkoutCreate` | `CreateWorkout`  | title:"Create workout", headerTitleAlign:"center" |                     |
| `PendingWorkout` | `PendingWorkout` (memo) | `presentation: "modal"`, headerShown:false | `{delayTimerStart: 0, workoutId: ""}` |
| `WorkoutSummary` | `WorkoutSummary` | headerTitle:"Summary"           |                                        |

**screenOptions:** `{ headerStyle: { backgroundColor: Colors.primary }, animation: "default" }`

**Export:** `export default WorkoutScreens`

---

### 4g. Flashcards (Notes) Stack

**File:** `features/flashcards/Main.tsx`

**Stack type:** untyped (`createNativeStackNavigator()`)

**Screens:**

| Route                | Component               | Options                                    |
|----------------------|-------------------------|--------------------------------------------|
| `Notes`              | `NotesScreen`           | `headerShown: false`                       | initialRouteName |
| `CreateFlashCards`   | `CreateFlashCards`      | `presentation: "modal"`, headerStyle (bg)  |
| `FlashCard`          | `FlashCardScreen`       | `headerShown: false`, headerStyle (bg)     |
| `SwipeFlashCards`    | `SwipeFlashCardsScreen` | `headerShown: false`, `presentation: "fullScreenModal"` |
| `CreateFlashCardGroup` | `CreateFlashCardGroup` | `presentation: "modal"`, headerStyle (bg) |

**screenOptions:** `{ animation: "default" }`

**Export:** `export default NotesScreens`

---

### 4h. Authentication Stack

**File:** `features/authentication/Main.tsx`

**Stack type:** untyped (`createNativeStackNavigator()`)

**Screens:**

| Route      | Component | Options               |
|------------|-----------|-----------------------|
| `Landing`  | `Landing`  | `headerShown: false` | initialRouteName |
| `Login`    | `Login`    | default               |
| `Register` | `Register` | default               |

**screenOptions:** `{ headerStyle: { backgroundColor: Colors.primary }, animation: "default" }`

**Export:** `export default AuthenticationScreens` (arrow function, no props)

---

## 5. Screen-by-Screen Inventory

### Complete file list with export names, prop types, and line counts

#### Authentication (4 files)
| Screen File | Export | Props Type | Lines |
|---|---|---|---|
| `features/authentication/pages/Landing.tsx` | `Landing` | `any` | ~60 |
| `features/authentication/pages/Login.tsx` | `Login` | none | ~32 |
| `features/authentication/pages/Register.tsx` | `Register` | none | ~35 |

#### Home (3 files)
| Screen File | Export | Props Type | Lines |
|---|---|---|---|
| `features/home/Root.tsx` | `Root` | `HomeScreenProps<"Root">` | ~210 |
| `features/home/components/NotificationsModal.tsx` | `NotificationsScreen` | `any` | — |
| `features/home/components/SettingsModal.tsx` | `SettingsScreen` | `any` | — |

#### Wallet (19 files including sub-stacks)
| Screen File | Export | Props Type | Lines |
|---|---|---|---|
| `features/wallet/pages/Wallet.tsx` | `WalletScreen` | `WalletScreens<"Wallet">` | ~366 |
| `features/wallet/pages/CreateExpense.tsx` | `CreateExpenseModal` | `any` | ~274 |
| `features/wallet/pages/Expense.tsx` | `Expense` | `any` | ~387 |
| `features/wallet/pages/Filters.tsx` | `ExpenseFiltersSheet` | none | ~222 |
| `features/wallet/pages/Subscription.tsx` | `SubscriptionDetails` | local interface | ~499 |
| `features/wallet/pages/EditSubscription.tsx` | `EditSubscription` | local interface | ~652 |
| `features/wallet/pages/EditBalance.tsx` | `EditBalance` | `WalletScreens<"EditBalance">` | ~288 |
| `features/wallet/pages/CreateSubAccount.tsx` | `CreateSubAccount` | `WalletScreens<"CreateSubAccount">` | ~285 |
| `features/wallet/pages/TransferSubAccount.tsx` | `TransferSubAccount` | `WalletScreens<"TransferSubAccount">` | ~383 |
| `features/wallet/pages/WalletCharts.tsx` | `Charts` | `any` | ~287 |
| `features/wallet/pages/AiStatsChat.tsx` | `AiStatsChat` | `WalletScreens<"AiStatsChat">` | ~447 |
| `features/wallet/pages/ExpensesListScreen.tsx` | `ExpensesListScreen` | `WalletScreens<"ExpensesList">` | ~392 |
| `features/wallet/pages/SubscriptionsListScreen.tsx` | `SubscriptionsListScreen` | `WalletScreens<"SubscriptionsList">` | ~48 |
| `features/wallet/pages/LimitsDetail.tsx` | `LimitsDetail` | `WalletScreens<"LimitsDetail">` but route NOT in WalletRootStack | ~516 |
| `features/wallet/pages/CreateLimits.tsx` | `CreateLimits` | `WalletScreens<"CreateLimits">` but route NOT in WalletRootStack | ~293 |
| `features/wallet/pages/SpendingLimits/Index.tsx` | `SpendingLimitsIndex` | `any` | ~150 |
| `features/wallet/pages/SpendingLimits/Create.tsx` | `SpendingLimitsCreate` | `any` | ~125 |
| `features/wallet/pages/CorrectionMaps/Index.tsx` | `CorrectionMapsScreen` | `any` | ~140 |
| `features/wallet/pages/CorrectionMaps/Create.tsx` | `CorrectionMapForm` | `any` | ~210 |

#### Timeline (10 files)
| Screen File | Export | Props Type | Lines |
|---|---|---|---|
| `features/timeline/pages/Timeline.tsx` | `Timeline` | `TimelineScreenProps<"Timeline">` | ~166 |
| `features/timeline/pages/TimelineCreate.tsx` | `CreateTimeLineEventModal` | `TimelineScreenProps<"TimelineCreate">` | ~255 |
| `features/timeline/pages/TimelineDetails.tsx` | `TimelineDetails` | `TimelineScreenProps` | ~252 |
| `features/timeline/pages/TimelineDoScreen.tsx` | `TimelineDoScreen` | `TimelineScreenProps<"TimelineDo">` | ~440 |
| `features/timeline/pages/CreateTimelineTodos.tsx` | `CreateTimelineTodos` | `TimelineScreenProps<"CreateTimelineTodos">` | ~239 |
| `features/timeline/pages/ImagesPreview.tsx` | `ImagesPreview` | `TimelineScreenProps<"ImagesPreview">` | ~172 |
| `features/timeline/pages/MissedEventsModal.tsx` | `MissedEventsModal` | `TimelineScreenProps<"MissedEventsModal">` | ~71 |
| `features/timeline/pages/CopyTimelineModal.tsx` | `CopyTimelineModal` | local interface | ~199 |
| `features/timeline/pages/TodosTransferModal.tsx` | `TodosTransferModal` | `any` | ~255 |
| `features/timeline/pages/Search.tsx` | (defined in types but not in navigator) | — | — |

#### Goals (5 files)
| Screen File | Export | Props Type | Lines |
|---|---|---|---|
| `features/goals/pages/Goals.tsx` | `Goals` | `any` | ~170 |
| `features/goals/pages/CreateGoal.tsx` | `CreateGoal` | `any` | ~145 |
| `features/goals/pages/Goal.tsx` | `Goal` | `any` | ~190 |
| `features/goals/pages/IconPicker.tsx` | `IconPicker` | `any` | ~23 |
| `features/goals/pages/UpdateGoalEntry.tsx` | `UpdateGoalEntry` | `any` | ~200 |

#### Workout (6 files)
| Screen File | Export | Props Type | Lines |
|---|---|---|---|
| `features/workout/pages/Workouts.tsx` | `Workouts` | `WorkoutScreenProps<"Workouts">` | ~111 |
| `features/workout/pages/Workout.tsx` | `Workout` | `WorkoutScreenProps<"Workout">` | ~241 |
| `features/workout/pages/WorkoutCreate.tsx` | `WorkoutCreate` | `WorkoutScreenProps<"WorkoutCreate">` | ~190 |
| `features/workout/pages/CreateExercise.tsx` | `ExerciseScreen` | `WorkoutScreenProps<"Exercise">` | ~13 |
| `features/workout/pages/PendingWorkout.tsx` | `PendingWorkout` (memo) | `WorkoutScreenProps<"PendingWorkout">` | ~306 |
| `features/workout/pages/WorkoutSummary.tsx` | `WorkoutSummary` | `WorkoutScreenProps<"WorkoutSummary">` | ~85 |

#### Flashcards (5 files)
| Screen File | Export | Props Type | Lines |
|---|---|---|---|
| `features/flashcards/pages/NotesScreen.tsx` | `NotesScreen` | `ScreenProps<any>` | ~100 |
| `features/flashcards/pages/CreateFlashCardGroup.tsx` | `CreateFlashCardGroup` | `any` | ~55 |
| `features/flashcards/pages/CreateFlashCards.tsx` | `CreateFlashCards` | `any` | ~295 |
| `features/flashcards/pages/FlashCard.tsx` | `FlashCardScreen` | `any` | ~270 |
| `features/flashcards/pages/SwipeFlashCards.tsx` | `SwipeFlashCardsScreen` | `any` | ~110 |

---

## 6. Deep Linking Configuration

**File:** `utils/hooks/useDeeplinking.tsx` (111 lines)

This is a **custom hook** that builds a `LinkingOptions<RootStackParamList>` object manually. It does **not** use `useLinking` from React Navigation.

### URL scheme:
```ts
const prefix = Linking.createURL("/")  // resolves to "mylife://"
```
Registered in `app.json` at `expo.scheme: "mylife"`.

### URL routing table:

| URL Pattern                     | Target Navigation                                                |
|--------------------------------|-----------------------------------------------------------------|
| `mylife://wallet/create-expense`  | `WalletScreens` → `CreateExpense` with `expenseId: null`       |
| `mylife://wallet/expense/id/{id}` | `WalletScreens` → `Wallet` with `{ expenseId }`               |
| `mylife://wallet/charts`         | `WalletScreens` → `Charts`                                     |
| `mylife://wallet`                | `WalletScreens` → `Wallet`                                     |
| `mylife://timeline/create`       | `TimelineScreens` → `TimelineCreate`                           |
| `mylife://timeline/id/{id}`      | `TimelineScreens` with `{ timelineId }` (handled by TimelineScreens init effect → TimelineDetails) |
| `mylife://timeline`              | `TimelineScreens` → `Timeline`                                 |

Both `mylife` and `lifeapp` URL prefixes are accepted (line 14).

### LinkingOptions structure:
```ts
{
  prefixes: [prefix],
  getInitialURL: async () => {
    const url = await Linking.getInitialURL()
    if (url != null) return url
    const response = Notifications.getLastNotificationResponse()
    return response?.notification.request.content.data?.eventId
  },
  subscribe(listener) {
    const linkingSubscription = Linking.addEventListener("url", ({ url }) => {
      navigate(url)
      listener(url)
    })
    const pushNotificationSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const url = response.notification.request.content.data?.eventId
        if (!url) return
        listener(url as string)
      },
    )
    return () => {
      linkingSubscription.remove()
      pushNotificationSubscription.remove()
    }
  },
}
```

### Consumption:
In `navigation/index.tsx` line 57:
```ts
const linking = useDeeplinking(navigationRef as any)
```
Passed to `<NavigationContainer linking={linking}>`.

---

## 7. Notification-Driven Navigation

**File:** `utils/hooks/useNotifications.ts` (148 lines)

### Navigation logic (`handleNotificationNavigation`):

| Notification `type`   | `eventId`         | Navigation Target                                         |
|-----------------------|-------------------|-----------------------------------------------------------|
| `"timeline"`          | single string     | `TimelineScreens` → `TimelineDetails` with `{ timelineId: eventId }` |
| `"timeline_missed"`   | array of strings  | `TimelineScreens` → `MissedEventsModal` with `{ eventIds: eventId }` |
| `"expenseReminder"`   | —                 | `WalletScreens` → `CreateExpense`                         |
| (default)             | single string     | `TimelineScreens` → `TimelineDetails` with `{ timelineId: eventId }` |

### Registration:
Called at `navigation/index.tsx` line 27:
```ts
const { sendTokenToServer } = useNotifications(navigationRef as any)
```

### Key behavior:
- Listens for `NotificationResponseReceived` and `useLastNotificationResponse()`
- Waits for `navigationRef.current.isReady()` (with 500ms fallback timeout)
- Registers push notification token after authentication (line 40-49)
- Handles 403 errors by clearing Apollo store and logging out

---

## 8. Quick Actions Navigation

**File:** `utils/hooks/useQuickActions.tsx` (82 lines)

Home screen quick actions (iOS) mapping:

| Action ID | Title     | Navigation                                               |
|-----------|-----------|----------------------------------------------------------|
| `"0"`     | Wallet    | `WalletScreens` with `expenseId: null`                   |
| `"1"`     | Timeline  | `TimelineScreens` with `selectedDate: format(new Date())` |
| `"2"`     | Goals     | `GoalsScreens` with `selectedDate: format(new Date())`   |

Called from `navigation/index.tsx` line 29:
```ts
useQuickActions(navigationRef as any)
```

### Quick action setup:
```ts
QuickActions.setItems([
  { title: "Wallet", subtitle: "Create expense or income", icon: Platform.OS === "ios" ? "symbol:plus.circle" : undefined, id: "0" },
  { title: "Timeline", subtitle: "Create a new entry", id: "1" },
  { title: "Goals", subtitle: "Create a new goal", id: "2" },
])
```

Uses `expo-quick-actions` plugin (registered in `app.json` plugins array).

---

## 16. Global Navigation Replacement Strategy

Currently, `navigationRef` is used to navigate from outside React components (e.g., inside utility functions, Notification handlers, Apollo error links).

**Expo Router Solution:**
- Expo Router provides an imperative `router` object that can be imported directly anywhere, even outside of React components.
- Replace `navigationRef.current?.navigate(...)` with:
  ```ts
  import { router } from 'expo-router';
  
  // Use absolute paths
  router.push('/(tabs)/wallet');
  router.replace('/(tabs)/timeline');
  router.setParams({ expenseId: "123" });

## 9. Custom Tab Bar Component

**File:** `components/BottomTab/BottomTab.tsx` (611 lines)

### Interface:
```ts
export default function BottomTab({ navigation, state }: BottomTabBarProps)
```

### Tabs displayed:

| Route            | Icon Name (SF Symbol) | Label     | Long-press Action                           |
|------------------|-----------------------|-----------|---------------------------------------------|
| `Root`           | `house`              | Home      | —                                           |
| `WalletScreens`  | `creditcard`          | Wallet    | Navigate to WalletScreens with `expenseId: null` |
| `TimelineScreens`| `calendar`            | Timeline  | Navigate to TimelineScreens with `selectedDate: today` |
| `GoalsScreens`   | `scope`              | Training  | —                                           |

### Features:
- Uses `SymbolView` (SF Symbols) — all icon names are SF Symbols
- Active indicator with glow effect (`shadowColor: Colors.secondary`)
- Pan gesture for swipe-based tab switching
- Swipe-up-to-long-press gesture (drag up > 50px triggers long-press handler)
- Animated indicator using `react-native-reanimated`
- Search toggle (`SearchButton` sub-component) that opens an AI chat or search bar
- Context menu integration via `react-native-context-menu-view`
- Exposed gradient background at bottom of screen
- Hides on keyboard open when in sub-screen
- Uses `useNavigation()` (hook) for `Btn` internal navigation
- Uses `useAppSelector`/`useAppDispatch` from Redux for search state
- Uses `useSearchMenu` from `contexts/SearchMenuContext`
- Uses `useAiChat` from `contexts/AiChatContext`
- Uses `getGlobalScrollY` from `utils/hooks/ui/useTrackScroll`

### Styling:
```ts
container: { width: Layout.screen.width, flexDirection: "row", position: "absolute", bottom: 20, alignSelf: "center", paddingHorizontal: 15, left: 0 },
innerContainer: { flexDirection: "row", position: "relative", borderRadius: 100 },
```

---

## 10. Live Activity Deep Links

### Activity Manager URLs:

| File | URL Pattern |
|---|---|
| `utils/services/ActivityManager.ts` | `lifeapp://activity/${config.eventId}` |
| `utils/hooks/useActivityCore.ts` | `lifeapp://activity/${config.eventId}` |

### Timeline share URLs:

| File | URL Pattern |
|---|---|
| `features/timeline/pages/TimelineDetails.tsx` | `mylife://timeline/id/${data.id}` |
| `features/timeline/components/TimelineItem.tsx` | `mylife://timeline/id/${timeline.id}` |
| `features/timeline/components/DayTimelineItemWrapper.tsx` | `mylife://timeline/id/${timeline.id}` |

### iOS Widget / Live Activity:
- `modules/expo-live-activity/index.ts` — `startCountdownActivity` exposes `deepLinkURL` param
- `modules/expo-live-activity/ios/ExpoLiveActivityModule.swift` — `WidgetAttributes.deepLinkURL` (default `"mylife://default"`)
- `targets/widget/WidgetLiveActivity.swift` — `.widgetURL(URL(string: context.attributes.deepLinkURL))`

---

## 11. Navigation Hooks & Utilities

### `useNavigation()` usage — every file that calls it:
(Affected screens must migrate to `useRouter()` + `useLocalSearchParams()` or `useGlobalSearchParams()`)

**Authentication:**
- `features/authentication/components/ChangeButton.tsx`
- `features/authentication/components/RegisterForm.tsx`
- `features/authentication/components/LoginForm.tsx`

**Flashcards:**
- `features/flashcards/pages/CreateFlashCards.tsx`
- `features/flashcards/components/FlashCardGroup.tsx`
- `features/flashcards/components/FlashCards/FlashCard.tsx`

**Goals:**
- `features/goals/components/GoalCategory.tsx`

**Wallet:**
- `features/wallet/hooks/useCreateExpensePage.ts`
- `features/wallet/pages/Filters.tsx`
- `features/wallet/components/Wallet/SubscriptionCalendar.tsx`
- `features/wallet/components/Wallet/SubscriptionsList.tsx`
- `features/wallet/components/Wallet/ExpensesList.tsx`
- `features/wallet/components/Wallet/SubAccountCards.tsx`
- `features/wallet/components/CreateExpense/ExpenseNumberPad.tsx`
- `features/wallet/components/CreateExpense/ExpenseAIMaker.tsx`
- `features/wallet/components/Expense/SimilarExpenses.tsx`

**Timeline:**
- `features/timeline/pages/MissedEventsModal.tsx`
- `features/timeline/components/FileList.tsx`
- `features/timeline/components/WeekView.tsx`
- `features/timeline/components/MonthView.tsx`
- `features/timeline/components/DayTimelineItemWrapper.tsx`
- `features/timeline/components/TimelineTodos.tsx`
- `features/timeline/components/CreateTimeline/SuggestedEvents/SuggestedEvents.tsx`
- `features/timeline/components/CreateTimeline/SuggestedEvents/useSuggestedEvents.tsx`
- `features/timeline/hooks/useFileManagement.tsx`
- `features/timeline/hooks/mutation/useEditOccurrence.ts`
- `features/timeline/hooks/mutation/useEditTimeline.ts`
- `features/timeline/hooks/mutation/useCreateEvent.tsx`
- `features/timeline/hooks/mutation/useCopyTimeline.tsx`

**Workout:**
- `features/workout/pages/Workouts.tsx`
- `features/workout/components/WorkoutWidget.tsx`
- `features/workout/components/ClockTimer.tsx` (useIsFocused)
- `features/workout/components/Menu.tsx`

**Home:**
- `features/home/components/EventsWidget.tsx`
- `features/home/components/NotFound.tsx`

**Shared:**
- `components/BottomTab/BottomTab.tsx`
- `components/ui/Header/Header.tsx`
- `components/ui/Dialog/Delete/DeleteTimelineEvent.tsx`
- `components/ui/Dialog/Delete/DeleteAllTimelineEvents.tsx`
- `components/DateList/DateList.tsx`
- `components/ui/TimeKeeper/TimeKeeper.tsx` (useIsFocused)

### `useIsFocused` / `useFocusEffect` usage:
- `hooks/useSetSearchMenu.ts`
- `utils/hooks/ui/useTrackScroll.ts`
- `components/ui/TimeKeeper/TimeKeeper.tsx`
- `features/workout/components/ClockTimer.tsx`

### `navigation.setOptions()` usage:
- `features/workout/pages/Workout.tsx` (line 86)
- `features/wallet/pages/SpendingLimits/Create.tsx` (line 84)
- `features/wallet/pages/EditBalance.tsx` (line 89)
- `features/wallet/pages/SpendingLimits/Index.tsx` (line 151)
- `features/wallet/pages/CorrectionMaps/Index.tsx` (line 51)
- `features/wallet/pages/CorrectionMaps/Create.tsx` (line 197)

### `navigation.push()` / `navigation.replace()` usage:
- `features/workout/pages/PendingWorkout.tsx` (`push`)
- `features/wallet/components/Expense/SimilarExpenses.tsx` (`push`)
- `features/wallet/components/CreateExpense/ExpenseAIMaker.tsx` (`replace`)
- `features/flashcards/pages/CreateFlashCardGroup.tsx` (`replace`)

### `navigation.goBack()` usage:
Heavy usage across all features — too many to list individually. Key files:
- All timeline mutation hooks (useEditOccurrence, useEditTimeline, useCreateEvent)
- All modal screens (timeline modals, wallet modals, goals modals, flashcards modals)
- `components/ui/Header/Header.tsx`
- `components/ui/Button/IconBackButton.tsx` (uses `navigationRef`)

---

## 12. External Navigation (navigationRef)

**Source:** `navigation/index.tsx` line 20
```ts
export const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>()
```

**Files that import `navigationRef` from `@/navigation`:**

| File | Usage |
|---|---|
| `components/ui/Button/IconBackButton.tsx` | `canGoBack()`, `goBack()` |
| `features/timeline/components/TimelineItem.tsx` | `navigate("TimelineScreens", ...)` |
| `features/timeline/components/WeekView.tsx` | `navigate("TimelineScreens", ...)` |
| `features/timeline/components/MonthView.tsx` | `navigate("TimelineScreens", ...)` |
| `features/wallet/components/Wallet/WalletItem.tsx` | `navigate("WalletScreens", ...)` |
| `features/wallet/components/AiChat/SkillCard.tsx` | Multiple `navigate(...)` calls to WalletScreens and TimelineScreens |

### How `navigate` is called via navigationRef (pattern):
```ts
navigationRef.current?.navigate<any>("TabName", {
  screen: "ScreenName",
  params: { ... }
})
```

### tab press behavior from DeepLink/Notifications/QuickActions:
All these hooks target the **tab name** with nested params:
- `"WalletScreens"` → `{ screen: "CreateExpense" }` or `{ screen: "Wallet", params: { expenseId } }`
- `"TimelineScreens"` → `{ screen: "TimelineDetails", params: { timelineId } }` or `{ timelineId }` (tab-level param detected in init effect)

---

## 15. Authentication Guarding (Expo Router Pattern)

Expo Router does not support conditionally rendering routes at the root level like React Navigation. Instead, all routes exist, but access is controlled via Route Guards.

**Strategy:**
- Create an `(auth)` group and an `(app)` group (or use `(tabs)` as the protected group).
- Implement a `useProtectedRoute` hook inside the root `_layout.tsx` (or an intermediate layout).
- Use `expo-router`'s `<Redirect href="/landing" />` or `router.replace('/landing')` inside a `useEffect` to kick unauthenticated users out of the `(tabs)` group.
- Ensure the splash screen remains visible (`SplashScreen.preventAutoHideAsync()`) until the authentication state is fully resolved to prevent UI flickering.

### Entry Point Changes:
- `App.tsx` will be completely deleted. 
- Global providers currently in `App.tsx` must be moved to `app/_layout.tsx`.
- **package.json update:** `main` must be changed from `node_modules/expo/AppEntry.js` (or `App.tsx`) to `"expo-router/entry"`.

## 13. Dependencies to Replace/Keep

### Will be removed (React Navigation packages):
- `@react-navigation/native`
- `@react-navigation/native-stack`
- `@react-navigation/bottom-tabs`
- `@react-navigation/elements` (if used — check)
- `react-native-screens` (comes with Expo, still needed by expo-router)

### Replaced by:
- `expo-router` (includes file-based routing)
- `expo-linking` (still needed for URL scheme)

### Must keep:
- `expo-linking` (used in deeplink hook and for share URLs)
- `react-native-safe-area-context` (still needed, though expo-router provides `useSafeAreaInsets`)
- `react-native-gesture-handler` (still needed for gestures, BottomTab)
- `@gorhom/bottom-sheet` (modals, still needed)
- `expo-notifications` (push notification handling)
- `expo-quick-actions` (home screen quick actions)
- `expo-symbols` (SymbolView for tab bar icons)

---

## 14. app.json Configuration

- **Scheme:** `"mylife"`
- **iOS associatedDomains:** `applinks:life.dmqq.dev`
- **Android intentFilters:**
  - `https://*.life.dmqq.dev/*`
  - `mylife://*`
- **iOS entitlements:** `com.apple.developer.associated-domains: ["applinks:life.dmqq.dev"]`
- **Project ID:** `5596a83c-661a-4477-806f-ee4c8a125f7e`
- **Owner:** `dmq`

---

## Migration Checklist

### Phase 1: File Structure
- [ ] Create `app/` directory
- [ ] Map `_layout.tsx` files for each navigation tier
- [ ] Root layout → tab layout
- [ ] Each tab → stack layout
- [ ] Modal screens → group routes with `(modal)` convention

### Phase 2: Replace Navigation APIs
- [ ] Replace `useNavigation()` → `useRouter()` where appropriate
- [ ] Replace `navigation.navigate("Route", {params})` → `router.push({ pathname: "/(tab)/route", params })`
- [ ] Replace `useRoute()` → `useLocalSearchParams()` / `useGlobalSearchParams()`
- [ ] Replace `navigation.goBack()` → `router.back()`
- [ ] Replace `navigation.setOptions()` → expo-router static `options` export or `useLayoutEffect`
- [ ] Replace `navigation.push()` → `router.push()`
- [ ] Replace `navigation.replace()` → `router.replace()`

### Phase 3: Deep Linking Migration
- [ ] Migrate `useDeeplinking` custom hook → expo-router's built-in linking
- [ ] Configure `app.json` scheme → expo-router `scheme` config
- [ ] Preserve `handleNotificationNavigation` logic for push notification deep links
- [ ] Preserve quick action → route mapping

### Phase 4: Context Providers
- [ ] Move necessary providers from `App.tsx` into root `_layout.tsx`
- [ ] Ensure `<Stack>` from expo-router wraps all screen content

### Phase 5: Screen Props Migration
- [ ] Replace all typed screen props (`TimelineScreenProps`, `WalletScreens`, etc.) with `useLocalSearchParams`
- [ ] Replace all `any`-typed screen props with proper SearchParams types

### 4. Add Missing Items to the "Migration Checklist"
Your checklist is great, but it needs a few Expo-Router-specific steps added to ensure type safety, custom UI mapping, and error handling. Add these checkboxes:

```markdown
### Phase 1: File Structure (Additions)
- [ ] Map `features/home/components/NotFound.tsx` to Expo Router's root `+not-found.tsx` file.
- [ ] Integrate the custom `BottomTab` component into the `app/(tabs)/_layout.tsx` using `<Tabs tabBar={(props) => <BottomTab {...props} />} />`.
- [ ] Handle `transparentModal` screens (like `ImagesPreview`) by creating a layout group with `presentation: "transparentModal"` and `animation: "fade"`.

### Phase 5: Screen Props Migration (Additions)
- [ ] Enable Expo Router Typed Routes by adding `"expo-router": { "typedRoutes": true }` to `app.json` under `experiments`.
- [ ] Refactor TypeScript interfaces: Replace `RouteProp` and `StackScreenProps` with strictly typed outputs from Expo Router's auto-generated types.

### Phase 7: App State & Global UI (New Phase)
- [ ] Move Sentinel/Sentry initialization from `App.tsx` to the top level of `app/_layout.tsx`.
- [ ] Move `Notifications.setNotificationHandler` to the global scope of `app/_layout.tsx`.
- [ ] Nest the massive provider tree (SafeArea, Theme, Apollo, Redux, BottomSheet, etc.) inside `app/_layout.tsx`, wrapping the `<Slot />` or `<Stack />`.

### Phase 6: Remove Old Files
- [ ] Delete `navigation/index.tsx`
- [ ] Delete `navigation/` directory
- [ ] Delete `types.tsx` navigation types (keeping domain types)
- [ ] Remove old dependencies from `package.json`
- [ ] Delete `useDeeplinking.tsx`
- [ ] Update `App.tsx` (it should only render Expo Router's root layout)
