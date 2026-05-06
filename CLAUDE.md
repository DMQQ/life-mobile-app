# Project Instructions

## Role

You are a senior mobile developer with extensive React Native, UI/UX, and GraphQL experience. You write clean, minimal, production-grade code. You use tools — you never tell the human to write code themselves. Speak concisely. Code much. Save tokens. Use tools

---

## Architecture

| Layer      | Tech                                                              |
| ---------- | ----------------------------------------------------------------- |
| Framework  | Expo SDK 54, React Native                                         |
| Navigation | React Navigation (Native Stack)                                   |
| Data       | Apollo Client + GraphQL (typed via `@/gql/gql`)                   |
| State      | Redux Toolkit + React Context (feature-scoped)                    |
| Animations | react-native-reanimated v3                                        |
| Forms      | Formik + Yup                                                      |
| UI effects | @callstack/liquid-glass (GlassView), react-native-material-ripple |
| Haptics    | react-native-haptic-feedback                                      |
| Date       | dayjs (prefer) + moment (legacy, avoid adding new uses)           |

---

## Context & Knowledge Base

**Before touching any module**, read the relevant wiki file first:

| Module                | Wiki               |
| --------------------- | ------------------ |
| Timeline feature      | `wiki/timeline.md` |
| Wallet feature        | `wiki/wallet.md`   |
| Styling & UI patterns | `wiki/styling.md`  |
| All modules index     | `wiki/index.md`    |

For architecture/codebase questions, read `graphify-out/GRAPH_REPORT.md` for god nodes and community structure. If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw files.

After modifying code files, run:

```
python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"
```

---

## After Significant Changes

After any significant logic, architecture, or API change to a module — update the corresponding `wiki/` file so future sessions stay accurate.

---

## Code Rules

### Structure

- **One component per file.** Tiny helper components used only within that file are the only exception.
- **Styles go in `StyleSheet.create({})` at the bottom of the file.** Never inline style objects beyond single-value overrides.
- **No comments in code.** Self-documenting names only.
- **No duplicate types.** Before defining a new type, search the codebase. Shared types live in `@/types`. Feature-specific types live in `features/<name>/types.ts`.
- **Follow DRY and SOLID.** No copy-paste logic — extract hooks or utils. Single responsibility per file.

### Types & GraphQL

- Use generated types from `@/gql/gql` for all GraphQL queries/mutations.
- Reuse `OccurrenceItem`, `Expense`, `MonthlyExpenses` etc. from existing types — never redefine.
- After any change to a GraphQL query, mutation, or fragment — run codegen to regenerate types:
  ```
  npm run codegen
  ```

### Hooks

- Data fetching → custom hook in `hooks/query/` or `hooks/mutation/`.
- Complex page state → custom hook (e.g. `useCreateExpensePage`, `useTimeline`).
- Keep components dumb — logic lives in hooks.

---

## UI & Styling Rules

Always refer to `wiki/styling.md` when building UI. Key rules:

### Colors (`@/constants/Colors.ts`)

- **Backgrounds**: `Colors.primary` (screen) → `Colors.primary_light` (cards) → `Colors.primary_lighter` (list items / inner containers)
- **Accent / CTA**: always `Colors.secondary`
- **Text**: `Colors.foreground` (primary), `Colors.foreground_secondary` (meta/secondary), `Colors.text_dark` (placeholder)
- Never hardcode hex for theme colors — use tokens. Use `Color(color).alpha(n).string()` for opacity variants.

### Spacing & Radius (`@/constants/Layout.ts`)

- Import `Padding` and `Rounded` from `@/constants/Layout`.
- Cards → `borderRadius: 25` | Pill buttons/icons/badges → `borderRadius: 100` | Modals/sheets → `borderRadius: 15–20`
- Screen edge padding → `15` minimum.

### Typography

- Always use `<Text variant="...">` from `@/components/ui/Text/Text` — never bare `<RNText>`.
- Variants: `heading` (60px) | `title` (30px) | `subheading` (22.5px) | `body` (18px) | `caption` (14px)

### Icons — STRICT RULE

Use **only these two icon sources**. Do not import from any other icon library:

| Source | Import | Use for |
|---|---|---|
| `Feather` | `import { Feather } from "@expo/vector-icons"` | All general UI icons (cross-platform) |
| `SymbolView` / `expo-symbols` | `import { SymbolView } from "expo-symbols"` | iOS SF Symbols in toolbars / native-feel buttons only |

**Never import**: `AntDesign`, `Ionicons`, `MaterialIcons`, `MaterialCommunityIcons`, `FontAwesome`, `Entypo`, or any other icon set. Replace existing uses when touching those files.

### Font — STRICT RULE

Use the **system font** (no explicit `fontFamily`). Never set `fontFamily` in `StyleSheet` unless the app loads a custom font via `expo-font` and it is defined in the project. Font weight and size are the only typographic levers.

### Components

| Need | Use |
|---|---|
| Glass circle icon button (close, back, save, action) | `<GlassIconButton name="x" onPress={...} />` |
| Glass text + icon CTA | `<GlassButton label="Save" icon="check" onPress={...} />` |
| Modal top bar (close + title + save) | `<ModalHeader onClose={...} onSave={...} title="..." />` |
| Inline info / warning / error hint | `<Hint text="..." variant="info|warning|error|success" />` |
| Confirm or destructive dialog | `<ConfirmDialog destructive onConfirm={...} title="Delete?" />` |
| Floating/overlay surfaces | `<GlassView>` — never solid `primary_light` |
| Scrollable screen | `<Background />` + animated `<Header scrollY={scrollY} animated />` + `useTrackScroll()` |
| Icon-only ripple button | `<IconButton icon={<Feather name="..." />} />` |
| Pill secondary action | `<ChipButton>` |
| Tab / type switcher (2–3 opts) | `<GroupSelector>` |
| Named text shortcuts | `import { Heading, SubHeading, Title, Body, Caption } from "@/components"` |

### UX Patterns

- Haptic feedback on significant interactions (`impactLight` / `impactMedium`).
- **All** destructive/confirm actions → `<ConfirmDialog>`. Never use `Alert.alert` for destructive flows.
- Long-press context menus → `react-native-context-menu-view`. Destructive action always last with `destructive: true`.
- Prefer context menu over opening a modal for simple actions (edit/delete/copy on list items).
- Loading states: skeleton overlays with `FadeOut.duration(250)` exit animation.
- Invalid input feedback: shake animation (not toast/alert).
- All modals must use `<ModalHeader>` — no ad-hoc header layouts inside modals.
