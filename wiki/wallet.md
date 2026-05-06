# Wallet Feature

> `features/wallet/`

A full-featured personal finance module. Tracks expenses/income, subscriptions, spending limits, sub-accounts, and provides rich analytics with AI-powered prediction and chat.

---

## Navigation Stack (`Main.tsx`)

Entry: `WalletScreens` — `NativeStack` wrapped in `WalletContextProvider`.

| Screen | Route | Presentation |
|---|---|---|
| `Wallet` | `/` | fullscreen |
| `Expense` | `/expense` | fullscreen |
| `Charts` | `/charts` | fullscreen |
| `CreateExpense` | modal | modal |
| `Filters` | modal | modal |
| `Subscription` | `/subscription` | fullscreen |
| `EditSubscription` | modal | modal |
| `EditBalance` | modal | modal |
| `CreateLimits` | modal | modal |
| `LimitsDetail` | `/limits` | fullscreen |
| `CorrectionMaps` | modal | modal |
| `CorrectionMapForm` | modal | modal |
| `CreateSubAccount` | modal | modal |
| `TransferSubAccount` | modal | modal |

**Route params (key ones):**

```ts
Wallet:             { expenseId?: string }   // deep-link to open expense directly
CreateExpense:      { type, amount, category, date, description, shouldOpenPhotoPicker, isEditing }
CorrectionMaps:     { prefill?: { shop, description, category, amount } }
CorrectionMapForm:  { prefill?, editingItem?: CorrectionMap }
AiStatsChat:        { startDate: string; endDate: string }
CreateSubAccount:   { editSubAccount?: { id, name, description, color, icon, balance } }
TransferSubAccount: { fromId?: string }
```

---

## Global State

### `WalletContext` (`components/WalletContext.tsx`)

Single `useReducer`-based context wrapping the whole stack. Provides filter state + calendar date.

**Filter shape:**
```ts
{
  query: string           // text search
  amount: { min, max }   // amount range (default 0–999999999)
  date: { from, to }     // date range strings "YYYY-MM-DD"
  category: string[]     // multi-select category filter
  type: string | undefined  // "expense" | "income" | "refunded"
  skip: number           // pagination offset
  take: number           // page size (20)
  isExactCategory: boolean
  accountId: string | undefined
}
```

**Actions:** `SET_QUERY`, `SET_AMOUNT_MIN/MAX`, `SET_DATE_MIN/MAX`, `SET_CATEGORY`, `TOGGLE_CATEGORY`, `SET_TYPE`, `SET_SKIP`, `SET_ACCOUNT_ID`, `SET_IS_EXACT_CATEGORY`, `RESET`

`hasFilters` / `filtersDiffCount` — derived values comparing current vs initial state (deep flattened object diff).

Hook: `useWalletContext()`

---

### `CreateExpenseContext` (`context/CreateExpenseContext.tsx`)

Scoped to the `CreateExpense` modal only. Passed via `CreateExpenseProvider`.

**State:**
- `type`: `"expense" | "income" | null`
- `amount`: string (decimal-safe string accumulator)
- `name`: description text
- `category`: `keyof typeof Icons`
- `date`: `"YYYY-MM-DD" | null` (null = date picker open)
- `view`: `"main" | "category" | "spontaneous" | "account"`
- `SubExpenses[]`: array of sub-expenses before submit
- `isSubExpenseMode`: bool — adding components of a split expense
- `spontaneousRate`: 0–10 impulsiveness rating
- `subAccountId`: which sub-account to assign to
- `prediction`: AI prediction from `usePredictExpense`
- `optionsCollapsed`: controls expanded options panel

**Animated values:** `transformX` (shake on invalid), `optionsProgress` (options panel animation)

---

## Pages

### `Wallet.tsx` — main dashboard

- Animated header shows total balance (`animatedValue`); long-press → `EditBalance`.
- Toggle between **Expenses** view (`ExpensesList`) and **Subscriptions** view (`SubscriptionsList`) via repeat icon.
- **Header context menu** (3-dots): Limits, Edit Balance, Filters, Correction Rules.
- Right `+` button: adds expense or subscription depending on active view.
- Deep-link: `route.params.expenseId` → finds matching expense and navigates to `Expense` screen.
- `WalletSearchContext` (inline component): registers `useScreenSearch` + builds `SearchMenuItem` tree (Type / Date Range / Categories / Clear All / Advanced Filters) via `useSetSearchMenu`.
- 404 wallet error → renders `InitializeWallet` onboarding.

### `CreateExpense.tsx` — create / edit expense modal

Layout: full-screen with a bottom card (65% height, `primary_light` bg, rounded top corners).

**View routing** (controlled by `state.view`):
- `"main"` → `NameInput` + `ExpenseAIMaker` + `OptionsPicker` + `NumberPad`
- `"category"` → `CategorySelectorView`
- `"spontaneous"` → `SpontaneousRateSelector`
- `"account"` → `AccountSelector` (inline sub-account list)

**Type selector**: `GroupSelector` with `["Expense", "Income", "Refund"]`.

**AI prediction**: when name ≥ 3 chars, `PredictionView` banner appears. Save button turns into "Apply prediction" that auto-fills category/type/amount.

**Sub-expense mode**: adds partial amounts to `SubExpenses[]`; total is submitted as one expense with sub-line items.

After submit (create or edit): refetches `["GetWallet", "Limits", "StatisticsDayOfWeek", "GetZeroSpendings", "SubAccounts"]`.

### `Expense.tsx` — expense detail screen

Loads full expense via `GET_EXPENSE` query (includes `expenseSimilar`).

Sections (scrollable):
- `SubexpenseStack` — split items if any
- `ExpenseDetails` — category, date, type, spontaneous rate, balance before
- `CollapsibleThemedCalendar` — date highlighted
- `MonthlyBreakdown` — amount vs income/target
- `SubscriptionSection` — assign/create/cancel subscription
- `SimilarExpenses` — historical similar items
- `FileUpload` — attach receipts
- `MapPicker` — set/view location

**FloatingBottomToolBar** actions: Refund, Take Photo, Pick Image, Subscription menu, Set Location.

**Header actions**: Delete (Alert confirm), Edit (→ `CreateExpense` with `isEditing=true`).

Subscription management: create monthly subscription, cancel, enable/disable, assign to existing, remove from subscription — all via `useSubscription` hook.

### `WalletCharts.tsx` — analytics screen

Wraps itself in a fresh `WalletContextProvider` (isolated filter state, defaults to current month, type=expense, fetchAll=true).

**Chart sections (in order):**
1. `PieChart` — category breakdown pie
2. `Legend` — category list with totals; tap = filter list, long-press = exclude from chart
3. Filtered expense list (`WalletItem` cards) for selected category
4. `StatisticsSummary` — avg/min/max/total
5. `SpendingsByDayOfWeek` — bar chart
6. `FutureProjection` — month-end projection (only shown when date range ≈ 1 month)
7. `MonthlyCategoryComparison` — this vs last month
8. `LimitsComparison` — spending vs set limits
9. `MonthlySpendingHeatMap` — calendar heatmap
10. `HourlyHeatMap` — hour-of-day spending heatmap

Header: `DatePicker` (period mode) + AI chat button (→ `AiStatsChat` with date range).

### `AiStatsChat.tsx`

AI assistant that can query/analyze spending stats for the selected date range. Uses `SkillCard` component.

### `CorrectionMaps.tsx` / `CorrectionMapForm.tsx`

CRUD for correction rules. Rules auto-correct AI-scanned expenses (override shop/category/description) when match conditions are met (shop, description, category, amount range).

### `Filters.tsx`

Advanced filter form: amount range, date range, category multi-select, type, exact category toggle, sub-account selector.

### `LimitsDetail.tsx` / `CreateLimits.tsx`

View and create per-category monthly spending limits. `LimitsComparison` shows actual vs limit bars.

### `Subscription.tsx` / `EditSubscription.tsx`

Subscription detail view and edit form. `SubscriptionCalendar` shows billing timeline.

### `EditBalance.tsx`

Modal to manually adjust wallet balance.

### `CreateSubAccount.tsx` / `TransferSubAccount.tsx`

Create/edit sub-accounts (name, description, color, icon, balance). Transfer funds between sub-accounts.

---

## Components

### `Wallet/`

| Component | Purpose |
|---|---|
| `ExpensesList` | Sectioned list of `MonthlyExpenses` groups → `WalletItem` cards |
| `SubscriptionsList` | List of `SubscriptionItem` cards |
| `WalletItem` | Single expense row (icon, description, amount, date, category badge) |
| `SubAccountCards` | Horizontal scrollable sub-account balance cards |
| `CategoryBreakdown` | Mini bar chart of categories on main screen |
| `Limits` | Spending limit progress bars |
| `SubscriptionCalendar` | Calendar showing subscription billing dates |
| `WalletNotifications` | Badge/list for wallet notifications |
| `InitializeWallet` | Onboarding screen shown when no wallet exists (404) |
| `WalletLoader` | Full-screen skeleton loader |

### `CreateExpense/`

| Component | Purpose |
|---|---|
| `AmountDisplay` | Large amount display with shake animation on invalid input |
| `ExpenseNumberPad` | Numeric pad (0-9, ., C) |
| `NameInput` | Text input for expense description |
| `CategorySelect` / `CategorySelectorView` | Category grid picker |
| `OptionsPicker` | Collapsible options row (category, date, spontaneous, account) |
| `PredictionView` | Banner showing AI prediction with apply button |
| `SpontaneousRate` | Slider 0–10 for impulsiveness rating |
| `SubexpenseSheet` | Bottom sheet for entering individual sub-expenses |
| `ChooseDate` | Date display/picker trigger |
| `ExpenseAIMaker` | AI scanner: takes photo, extracts expense data |

### `Expense/`

| Component | Purpose |
|---|---|
| `ExpenseDetails` | Info rows: category, date, balance before, spontaneous rate |
| `ExpenseIcon` | Category icon + background color mapping (`Icons` record) |
| `SubexpenseStack` | Visual stack of split expense items |
| `MonthlyBreakdown` | Donut/bar showing expense vs income/target |
| `SimilarExpenses` | List of similar past expenses |
| `SimilarExpensesChart` | Chart of similar expense history |
| `SubscriptionSection` | Subscription assignment UI |
| `FileUpload` | Receipt image list + camera/library picker (imperative ref API) |
| `Map` | Apple Maps location picker (imperative ref API) |
| `ImageViewer` | Full-screen image preview |
| `EditNote` | Inline note editor |
| `FloatingBottomToolBar` | Bottom action bar (Refund, Photo, Subscription, Location) |

### `WalletChart/`

| Component | Purpose |
|---|---|
| `PieChart` | Category donut chart |
| `Charts` | Bar chart alternative |
| `Legend` | Category legend with tap/long-press interaction |
| `StatisticsSummary` | Avg/min/max/total stats panel |
| `SpendingsByDayOfWeek` | Bar chart by day |
| `FutureProjection` | Linear regression-based end-of-month projection |
| `MonthlyCategoryComparison` | This month vs last month by category |
| `LimitsComparison` | Actual vs limit bar chart |
| `MonthlySpendingHeatMap` | Calendar heatmap intensity |
| `HourlyHeatMap` | Hour-of-day spending heatmap |
| `LineChart` | Generic line chart |
| `ChartTemplate` | Base chart wrapper |
| `DateRangePicker` | Date range selector for charts |
| `ZeroSpendings` | Empty state for no-data periods |
| `ChartLoader` | Skeleton for chart loading state |
| `FutureProjection` | End-of-month spending projection |

### `Subscription/SubscriptionItem.tsx`

Single subscription card (name, billing date, amount, active status).

### `CorrectionMap/CorrectionMapItem.tsx`

Single correction rule card with toggle active switch.

### `AiChat/SkillCard.tsx`

Card component used in AI chat screen.

### `WalletContext.tsx`

See [Global State](#global-state) section above.

---

## Hooks

### Data Fetching

| Hook | Query/Mutation | Notes |
|---|---|---|
| `useGetWallet` | `GetWallet` | Primary data hook. Reads from `WalletContext` filters. Paginated by 3 months. Manual merge via `Map` on `fetchMore`. Filter changes debounced 1s before refetch. Exposes `onEndReached`. |
| `useGetBalance` | `GetWallet` | Thin wrapper, returns `wallet.balance` only |
| `useGetStatistics` | statistics queries | Aggregated stats for charts |
| `useGetLegendData` | `statisticsLegend` | Category totals + count for pie/legend |
| `useGetSubscriptions` | `subscriptions` | All active subscriptions |
| `useSubAccounts` | `SubAccounts` | wallet sub-accounts (cache-first) |
| `useCorrectionMaps` | `CorrectionMaps` | CRUD for correction rules |

### Expense Actions

| Hook | Mutation | Notes |
|---|---|---|
| `useCreateActivity` | `createExpense` | Create new expense |
| `useEditExpense` | `editExpense` | Edit existing expense |
| `useDeleteActivity` | `deleteExpense` | Delete expense |
| `useRefundExpense` | `refundExpense` | Mark as refunded |
| `useSubscription` | `createSubscription`, `cancelSubscription`, `assignExpenseToSubscription` | Subscription management on expense |
| `useUploadSubExpense` | `createSubExpenses` | Bulk-create sub-expenses |
| `useEditWallet` | `editWallet` | Update wallet settings (balance, income target) |
| `useReadAllNotifications` | mutation | Mark all wallet notifications read |

### Sub-Account Actions

| Hook | Mutations |
|---|---|
| `useCreateSubAccount` | `createSubAccount` |
| `useUpdateSubAccount` | `updateSubAccount` |
| `useDeleteSubAccount` | `deleteSubAccount` |
| `useTransferBetweenSubAccounts` | `transferBetweenSubAccounts` |

All refetch `SubAccounts` + `GetWallet` on complete.

### AI / Prediction

| Hook | Purpose |
|---|---|
| `usePredictCategory` (`usePredictExpense`) | `PredictExpense` query. Debounced 750ms. Triggers when name ≥ 3 chars. Returns `{ description, amount, category, type, shop, locationId, confidence }`. |

### UI / Page Logic

| Hook | Purpose |
|---|---|
| `useCreateExpensePage` | All state + logic for `CreateExpense` page. Manages amount string accumulator (decimal-safe), sub-expense mode, shake animation, prediction apply, edit vs create branching. Returns `{ state, methods, animated }`. |

---

## Data Model

### Expense

```ts
{
  id, amount, date, description, type, category
  spontaneousRate     // 0–10 impulsiveness score
  subAccountId        // nullable, which sub-account
  balanceBeforeInteraction
  note
  subscription?       { id, isActive, nextBillingDate, dateStart }
  location?           { id, kind, name, latitude, longitude }
  files[]             { id, url }
  subexpenses[]       { id, description, amount, category }
}
```

### Wallet

```ts
{
  id, balance, income, monthlyPercentageTarget
  expenses2[]  {        // paginated by month
    month               // "YYYY-MM"
    flow: { income, expense }
    expenses: Expense[]
  }
  subAccounts[] { id, name, description, color, icon, balance, isDefault, income, expense }
}
```

### CorrectionMap

```ts
{
  id, isActive, createdAt
  matchShop, matchDescription, matchCategory
  matchAmountMin, matchAmountMax
  overrideShop, overrideCategory, overrideDescription
}
```

---

## Category System

Defined in `components/Expense/ExpenseIcon.tsx` as `Icons` record.

Categories: `housing`, `transportation`, `food`, `drinks`, `shopping`, `addictions`, `work`, `clothes`, `health`, `entertainment`, `utilities`, `debt`, `education`, `savings`, `travel`, `animals`, `gifts`, `income`, `none`.

Each entry: `{ backgroundColor, icon }`. `CategoryUtils.getCategoryName(key)` returns display label.

---

## Key Patterns

- **Pagination**: `useGetWallet` fetches 3 months at a time using `fetchMore`. Results merged by month key via `Map`. Filter changes reset skip to 0 and debounce 1 second before refetch. A `generationRef` prevents stale results from racing updates.
- **AI prediction**: debounced query fires at 750ms after name input (≥3 chars). Save button dynamically becomes "Apply Prediction" when valid prediction exists but form isn't complete.
- **Sub-expense mode**: switches the number pad into "add component" mode. Each press of submit appends to `SubExpenses[]`. Final submit sends all sub-expenses together with the parent expense.
- **Correction rules**: server-side rules applied during AI scan. Frontend provides CRUD + prefill from `CorrectionMaps` screen (can be opened from `Wallet` header menu or from `Expense` detail suggestion).
- **Filter isolation on Charts**: `WalletCharts` mounts its own `WalletContextProvider` so chart filters don't bleed into the main wallet list.
- **Image upload (Expense)**: `FileUpload` uses imperative ref (`FileUploadHandle`) so `FloatingBottomToolBar` can trigger camera/library from outside the component.
- **Map location**: `MapPicker` similarly uses an imperative ref (`MapPickerHandle`); toolbar calls `triggerSearch()` to open Apple Maps search.
- **Sub-accounts**: expenses can be tagged to a sub-account (`subAccountId`). `AccountSelector` view inside `CreateExpense` lists all sub-accounts + "Default" option.
