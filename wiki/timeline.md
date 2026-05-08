# Timeline Feature

> `features/timeline/`

A full-featured scheduling/calendar module. Users create timed events ("occurrences"), attach todos and images, and view them across day/week/month layouts.

---

## Navigation Stack (`Main.tsx`)

Entry point: `TimelineScreens` — a `NativeStack` navigator mounted under `RootStack > TimelineScreens`.

| Screen | Route | Presentation |
|---|---|---|
| `Timeline` | `/` | fullscreen |
| `TimelineDetails` | `/:timelineId` | fullscreen |
| `TimelineCreate` | modal | modal |
| `ImagesPreview` | modal | transparentModal/fade |
| `CreateTimelineTodos` | modal | modal (semi-transparent bg) |
| `TodosTransferModal` | modal | modal |
| `CopyTimelineModal` | modal | modal |
| `TimelineDoScreen` | modal | modal |

Deep-link shortcut: if `TimelineScreens` receives `timelineId` param → navigates directly to `TimelineDetails`; if `selectedDate` param → navigates to `TimelineCreate`.

---

## Route Params (`types.ts`)

```ts
TimelineCreate: {
  selectedDate: string        // "YYYY-MM-DD"
  mode: "create" | "edit" | "shopping-list"
  timelineId?: string         // required when mode = "edit"
  todos?: string[]            // pre-filled todo texts
  title?: string
  description?: string
  beginTime?: string
  endTime?: string
}

TimelineDetails:  { timelineId: string }
TimelineDo:       { timelineId: string }
CopyTimelineModal:{ timelineId, timelineTitle, originalDate }
TodosTransferModal: { timelineId }
CreateTimelineTodos: { timelineId?, mode?: "create"|"push-back", todos: string[] }
```

---

## Pages

### `Timeline.tsx` — main list screen

- Renders `Header` with **ViewSwitcher** (D/W/M pills) and a `+` button.
- Title bar is a `DatePicker` wrapped in `GlassView`; tap opens the calendar.
- Day view shows `DateList` (horizontal date strip) below the header.
- Content is delegated to `TimelineContent` which swaps between `DayView / WeekView / MonthView` or a search `VirtualizedList`.
- Calls `usePrefetchMonthRange` on mount to warm the Apollo cache for ±1 month.
- Search: debounced 200 ms via `useScreenSearch`.

### `TimelineDetails.tsx` — event detail screen

- Loads occurrence via `useGetOccurrenceById(timelineId)`.
- Animated header: title collapses into header on scroll (`useAnimatedScrollHandler`).
- Sections: description, `TimelineTodos`, `FileList`, event ID.
- **FloatingBottomToolBar** actions: Add Todo, Upload image (camera/library), Start Live Activity, "Work on it" (→ `TimelineDoScreen`).
- Header buttons: delete (dialog), edit (→ `TimelineCreate` edit mode), complete toggle.
- Image upload: multipart POST to `/upload/multiple?type=timeline&entityId=<id>`, then writes to Apollo cache directly (`cache.modify`).

### `TimelineCreate.tsx` — create / edit modal

- Form built with **Formik** via `useCreateTimeline` hook.
- Fields: title*, description, time range (begin/end via `DateTimePicker`), reminder (segmented: Off/5m/15m/30m/1h), todos list.
- Time auto-advance: setting begin auto-sets end = begin + 1h (unless end was manually changed).
- Edit mode: pre-fills from `useGetOccurrenceById`; if event is repeating, shows `EditScopeSheet` to pick `THIS_ONLY | ALL`.
- Repeat config: `CreateRepeatableTimeline` bottom sheet.
- Submit: calls `createEvent` or `editOccurrence` mutation, then refetches month + day queries.

### `TimelineDoScreen.tsx` — focus/work mode

Modal for actively working on an event (details not read; loaded lazily).

### `CopyTimelineModal.tsx`, `TodosTransferModal.tsx`, `CreateTimelineTodos.tsx`

Helper modals for copying events to another date, transferring todos between events, and bulk-creating todos.

---

## Components

### `TimelineContent.tsx`

Coordinator that renders one of three view modes or a search results list, with enter/exit keyframe animations on mode switch.

| Mode | Component | Behaviour |
|---|---|---|
| `day` | `DayView` | swipeable pager |
| `week` | `WeekView` | week grid |
| `month` | `MonthView` | month calendar; tap day → switches to day view |
| search active | `VirtualizedList` of `TimelineItem` | |

### `DayView.tsx`

Virtual infinite-scroll pager using `react-native-pager-view`.

- Epoch = today's date. Each page index = epoch + N days.
- Window of **7 pages** slides as user swipes to edges (re-mounts pager with new key when window shifts).
- Haptic feedback (`impactLight`) on page change.
- Each page = `TimelineDayPage`.

### `TimelineDayPage.tsx`

Single day's event list + timeline ruler. Accepts `date`, `switchView`, `contentPaddingTop`.

### `TimelineItem.tsx`

Card component for one occurrence. Features:

- **Long-press context menu** (`react-native-context-menu-view`): Start Live Activity, Complete, Copy, Edit, Delete.
- Status badge: `To do` / `Late` (past end time, not completed) / `Finished`.
- Priority badge: Low (green) / Med (blue) / High (red) — threshold 4 and 7.
- Repeat indicator (Feather `repeat` icon).
- Press → navigates to `TimelineDetails`.

### `FloatingBottomToolBar.tsx`

Absolute-positioned glass bar at bottom of `TimelineDetails`. Buttons: Add Todo, Upload (camera/library context menu), Live Activity, Work on it.

### `DayTimeline.tsx`, `DayTimelineItem.tsx`, `DayTimelineItemWrapper.tsx`

Hour-grid timeline ruler components used inside `TimelineDayPage`.

### `CompletionBar.tsx`

Visual progress bar for todo completion ratio.

### `WeekView.tsx`, `MonthView.tsx`

Week/month calendar grids. Tapping a day calls `onDayPress` which switches back to day view.

### `TimelineTodos.tsx`, `TodoItem.tsx`, `TodoCheckbox.tsx`, `TodoPreviewCard.tsx`, `TodosPreviewSection.tsx`

Todo list UI inside details and item card. `TodosPreviewSection` shows up to N todos inline on `TimelineItem`.

### `FileList.tsx`, `UploadButton.tsx`

Image grid in `TimelineDetails`. `UploadButton` triggers camera/library picker.

### `EditScopeSheet.tsx`

Bottom sheet asking "Edit this occurrence only" or "Edit all occurrences" for repeating events.

### `LoaderSkeleton.tsx`

Skeleton placeholders shown while data loads.

### `timeline.styles.ts`

Shared `StyleSheet` used across timeline components.

### `CreateTimeline/`

| File | Role |
|---|---|
| `TimelineCreateHeader.tsx` | Header bar inside the create modal (date display, submit button) |
| `CreateRepeatableTimeline.tsx` | Bottom sheet for repeat config (frequency, interval, end date) |
| `SuggestedEvents/` | UI for browsing common event templates |
| `CommonEvents.data.ts` | Static list of suggested event templates |

---

## Hooks

### General

| Hook | Purpose |
|---|---|
| `useTimeline` | Wires `useGetOccurrencesQuery` + monthly dot query + view state + navigation helpers for the main screen |
| `useCreateTimeline` | Formik setup, create vs edit routing, scope sheet ref, post-submit cache refresh |
| `useTodos` | Todo list management for detail screen |

### Query

| Hook | GraphQL query | Notes |
|---|---|---|
| `useGetOccurrencesQuery` | `occurrences(date, endDate?, query?)` | Primary list. Search mode: passes `query`, omits `date`. fetchPolicy: cache-and-network |
| `useWeekEvents` | Same query, week range | Returns per-day grouped events |
| `useRangeEvents` | Same query, arbitrary range | |
| `usePrefetchMonthRange` | Same query | Eagerly fetches prev/current/next month on mount |
| `useGetOccurrenceById` | `occurrence(id)` | Detail screen |
| `useGetTimeLineQuery` | Timeline series query | |
| `useGetTimelineById` | Series by id | |

### Mutation

| Hook | Mutation | Notes |
|---|---|---|
| `useCreateEvent` | `createEvent` | Includes repeat config |
| `useEditOccurrence` | `editOccurrence` | Accepts scope `THIS_ONLY\|ALL` |
| `useCompleteOccurrence` | `completeOccurrence` | Toggle `isCompleted` |
| `useCompleteTimeline` | `completeTimeline` | |
| `useCopyTimeline` | `copyOccurrence` | |
| `useRemoveTimelineMutation` | `removeTimeline` | |
| `useCompleteTodo` | `completeTodo` | |
| `useQuickCompleteTodo` | | Double-tap shortcut |
| `useCreateOccurrenceTodo` | `createOccurrenceTodo` | |
| `useRemoveTodo` | `removeTodo` | |
| `useAddTodoFile` | | Attach file to a todo |
| `useRemoveTodoFile` | | Remove file from todo |
| `useTransferTodos` | | Move todos between occurrences |
| `useEditTimeline` | `editTimeline` | |

### Utility

| Hook | Purpose |
|---|---|
| `useDoubleTapComplete` | Recognizes double-tap gesture to toggle completion |
| `useFileManagement` | File list state + delete operations |
| `useFileUpload` | Image picker + upload to `/upload/multiple` |

---

## GraphQL Schemas (`hooks/schemas/schemas.ts`)

Key fragment:

```graphql
fragment OccurrenceFields on OccurrenceView {
  id  seriesId  date  position  title  description
  beginTime  endTime  isCompleted  isSkipped  isAllDay
  isRepeat  tags  priority  reminderBeforeMinutes
  todos { id  title  isCompleted  createdAt  modifiedAt
          files { id  type  url } }
  images { id  url  type  name }
}
```

Mutations defined: `createEvent`, `copyOccurrence`.

---

## Data Model

```
OccurrenceItem (one day's instance of an event)
  id, seriesId          — id = this occurrence, seriesId = the repeat series
  date                  — "YYYY-MM-DD"
  beginTime / endTime   — "HH:mm:ss"
  title, description
  isCompleted, isSkipped, isAllDay, isRepeat
  priority              — 1-10; ≥7 High, ≥4 Med, else Low
  reminderBeforeMinutes — null | 5 | 15 | 30 | 60
  tags                  — comma-separated string
  todos[]               — { id, title, isCompleted, files[] }
  images[]              — { id, url, type, name }
```

---

## Key Patterns

- **Apollo cache writes**: after image upload, occurrence is updated directly via `client.cache.modify` to avoid a refetch round-trip.
- **Repeat event editing**: scope sheet intercepts submit when `isRepeat=true`; stores `pendingEdit` in state until user picks scope.
- **Prefetch strategy**: `usePrefetchMonthRange` fires 3 parallel queries (prev/cur/next month) using `fetchPolicy: "network-only"` so week/month views are instant.
- **DayView infinite scroll**: virtual 7-page window repositions on edge approach; haptic on swipe.
- **Live Activity**: `useActivityUtils` from `@/utils/hooks/useActivityManager` — starts an iOS Live Activity via deep-link `mylife://timeline/id/<id>`.
