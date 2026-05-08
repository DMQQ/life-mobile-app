# Styling Guide

> Reference for building consistent UI across all features.

---

## 1. Color System (`constants/Colors.ts`)

Colors are loaded from `expo-secure-store` at boot, allowing runtime theme switching. Always import from `@/constants/Colors`.

```ts
import Colors from "@/constants/Colors"
```

### Primary (background) palette

| Token | Default | Use |
|---|---|---|
| `Colors.primary` | `#0d0f14` | Page/screen background |
| `Colors.primary_light` | primary + 25% lighter | Cards, input backgrounds |
| `Colors.primary_lighter` | primary + 40% lighter | Inner containers, list items |
| `Colors.primary_dark` | primary − 25% | Header backgrounds, overlays |
| `Colors.primary_darker` | primary − 50% | Calendar bg, deep overlays |

### Secondary (accent) palette

| Token | Default | Use |
|---|---|---|
| `Colors.secondary` | `#56E4F9` | CTAs, active state, highlights, badges |
| `Colors.secondary_light_1` | secondary + 25% | Subtle accents, time labels |
| `Colors.secondary_light_2` | secondary + 50% | Refunded state, dimmed accents |
| `Colors.secondary_dark_1` | secondary − 25% | Event backgrounds |
| `Colors.secondary_dark_2` | secondary − 50% | Deep accent shadows |

### Foreground (text/icon on dark bg)

| Token | Value | Use |
|---|---|---|
| `Colors.foreground` | `#FFFFFF` | Primary text, icon fills |
| `Colors.foreground_secondary` | white @ 70% opacity | Body text, secondary labels |
| `Colors.foreground_disabled` | white @ 40% opacity | Disabled states |
| `Colors.text_dark` | `"gray"` | Placeholder, empty state text |
| `Colors.text_light` | `#FAF8FF` | High-contrast text on dark |

### Ternary

| Token | Value | Use |
|---|---|---|
| `Colors.ternary` | `#7B84FF` | Supplementary accent (charts, streaks) |

### Semantic / status colors

| Context | Color | Token |
|---|---|---|
| Error | `#f44336` | `Colors.error` |
| Warning | `orange` | `Colors.warning` |
| Priority High | `#FF3B30` | hardcoded |
| Priority Med | `#007AFF` | hardcoded |
| Priority Low | `#34C759` | hardcoded |
| Income amount | `#66E875` | hardcoded |
| Expense amount | `#F07070` | hardcoded |
| Expired/overdue | `#BA4343` | hardcoded |
| Completed | `lightgreen` | hardcoded |

> When adding new status colors, use the hardcoded values above to stay consistent.

### Available secondary accent candidates

```ts
import { secondary_candidates } from "@/constants/Colors"
// 15 built-in options the user can pick from:
// "#00C896" "#F6B161" "#8685EF" "#1BA3B4" "#FFA51A"
// "#FF1A56" "#BE15A8" "#008CFF" "#F9F156" "#F95656"
// "#DB56F9" "#6056F9" "#56E4F9" "#34FA85" "#34A3FA"
```

### Opacity helpers

Use the `color` library (already a dep) to derive opacity/shade variants — **never hardcode** a semi-transparent hex:

```ts
import Color from "color"
Color(Colors.secondary).alpha(0.2).string()   // 20% fill for chip bg
Color(Colors.primary).lighten(0.4).string()   // == Colors.primary_lighter
```

---

## 2. Spacing & Sizing (`constants/Layout.ts`)

```ts
import { Padding, Rounded } from "@/constants/Layout"
import Layout from "@/constants/Layout"
```

### Padding scale

| Token | Value |
|---|---|
| `Padding.xxs` | 2.5 |
| `Padding.xs` | 5 |
| `Padding.s` | 7.5 |
| `Padding.m` | 10 |
| `Padding.l` | 15 |
| `Padding.xl` | 20 |
| `Padding.xxl` | 25 |

### Border radius scale (`Rounded` — same values as `Padding`)

| Token | Value | Typical use |
|---|---|---|
| `Rounded.xxs` | 2.5 | Activity grid cells |
| `Rounded.xs` | 5 | Small tags |
| `Rounded.s` | 7.5 | Toggle buttons, inner segments |
| `Rounded.m` | 10 | Option rows, toggle containers |
| `Rounded.l` | 15 | Modals, pickers, contained buttons |
| `Rounded.xl` | 20 | Floating containers, bottom sheets |
| `Rounded.xxl` | 25 | **Cards** (primary card radius) |
| `Rounded.half` | 50 | — |
| `Rounded.full` | 100 | **Pill buttons, icon buttons, badges** |

### Quick rules

- Cards → `borderRadius: 25` (`Rounded.xxl`)
- All icon buttons, badges, chip-style pills → `borderRadius: 100` (`Rounded.full`)
- Bottom sheet / modal inner surfaces → `borderRadius: 15–20`
- Standard card padding → `padding: 15` (`Padding.l`)
- Screen-level horizontal padding → `15` (standard), never less than `10`

### Device dimensions

```ts
Layout.screen.width   // screen width
Layout.screen.height  // screen height
Layout.isSmallDevice  // screen.width < 375
```

---

## 3. Typography (`constants/Colors.ts` + `components/ui/Text/Text.tsx`)

Always use the `<Text>` wrapper component — never bare `<RNText>`:

```ts
import Text from "@/components/ui/Text/Text"
```

### Variants

| variant | fontSize | weight | color | use |
|---|---|---|---|---|
| `heading` | 60 | bold | foreground | Large display number (balance, hero) |
| `title` | 30 | 600 | foreground | Screen/section titles |
| `subheading` | 22.5 | 600 | text_light | Sub-section headers |
| `subtitle` | 16 | 500 | foreground_secondary @ 80% | Supporting label |
| `body` | 18 | 400 | foreground | Normal content text |
| `caption` | 14 | 400 | foreground_secondary | Meta, timestamps, hints |

### Font sizes from `Sizing`

```ts
import { Sizing } from "@/constants/Colors"
// Sizing.heading  = 30  (title variant)
// Sizing.subHead  = 22.5
// Sizing.text     = 18  (body variant)
// Sizing.tooltip  = 14  (caption variant)
```

### Usage

```tsx
<Text variant="title">Section Header</Text>
<Text variant="body">Normal text</Text>
<Text variant="caption" style={{ color: Colors.text_dark }}>12 Jan</Text>
```

---

## 4. Core UI Components

### `<Card>`

```ts
import { Card } from "@/components"
```

Default style: `padding: 15`, `borderRadius: 25`, `backgroundColor: Colors.primary_lighter`, `borderWidth: 1`, `borderColor: primary_lighter + 50% lighter`.

Props: `animated?`, `ripple?`, `onPress?`, `onLongPress?`, `disabled?`

When `ripple=true` + `onPress` → scale-press animation (0.97 scale, 100ms).

### `<GlassView>`

```ts
import GlassView from "@/components/ui/GlassView"
```

Liquid glass morphism wrapper (`@callstack/liquid-glass`). Tint = `Colors.primary @ 75% opacity`. Use for floating toolbars, header pills, floating buttons.

```tsx
<GlassView style={{ padding: 7.5, paddingHorizontal: 15, borderRadius: 100 }}>
  {children}
</GlassView>
```

### `<Header>`

```ts
import Header from "@/components/ui/Header/Header"
```

Key props:

| prop | type | notes |
|---|---|---|
| `buttons` | `HeaderItem[]` | Left/right action icons |
| `animated` | `boolean` | Enables scroll-reactive title |
| `scrollY` | `SharedValue<number>` | Pass from `useTrackScroll()` or `useAnimatedScrollHandler` |
| `animatedTitle` | `string` | Title that shrinks on scroll |
| `animatedSubtitle` | `string` | Subtitle shown below title |
| `animatedValue` | `number` | Animated numeric display (balance etc) |
| `animatedValueFormat` | `(v) => string` | Formatter for numeric display |
| `goBack` | `boolean` | Shows back button |
| `shadow` | `boolean` | Drop shadow (default true) |
| `initialTitleFontSize` | `number` | Start size before shrink (50 default) |

`HeaderItem` shape:
```ts
{
  icon: ReactNode | SFSymbol
  onPress: () => void
  position?: "left" | "right"
  standalone?: boolean          // circular GlassView wrap
  tintColor?: string
  contextMenu?: { items: ContextMenuItem[] }
  children?: ReactNode          // override icon with custom content
}
```

Scroll integration pattern:
```ts
const [scrollY, onScroll] = useTrackScroll()
// or
const scrollY = useSharedValue(0)
const onScroll = useAnimatedScrollHandler({ onScroll: (e) => { scrollY.value = e.contentOffset.y } })
```

### `<Text>` — see Typography section above

### `<Background>`

```ts
import Background from "@/components/ui/Background"
```

Full-screen background layer. Always render as first child of screen root `<View style={{ flex: 1 }}>`.

---

## 5. Icon & Font Standards

### Icons — use only these two

| Library | Import | Use |
|---|---|---|
| `Feather` | `import { Feather } from "@expo/vector-icons"` | All general icons throughout the app |
| `expo-symbols` | `import { SymbolView } from "expo-symbols"` | iOS SF Symbols in native toolbars only |

Never use: `AntDesign`, `Ionicons`, `MaterialIcons`, `MaterialCommunityIcons`, `FontAwesome`, `Entypo`.

### Font family

System font only — never set `fontFamily` explicitly. Use `fontWeight` and `fontSize` to create hierarchy.

---

## 6. Button Components

### `<Button>` — Ripple-based

```ts
import Button from "@/components/ui/Button/Button"
```

```ts
variant?: "primary" | "secondary" | "ternary" | "disabled" | "text"
type?: "flat" | "contained" | "outlined" | "text"
size?: "xs" | "sm" | "md" | "lg" | "xl"    // maps to padding 2.5–20
borderRadius?: "no" | "sm" | "md" | "lg" | "full"  // 0/5/10/15/100
```

Color mapping:
- `primary` → `Colors.secondary` (accent)
- `secondary` → `Colors.primary`
- `ternary` → `Colors.secondary`
- `disabled` → `#131d33`

### `<ChipButton>` — Pill-shaped secondary action

```ts
import ChipButton from "@/components/ui/Button/ChipButton"
```

Style: `borderRadius: 100`, `backgroundColor: Colors.secondary @ 20%`, `borderWidth: 1`, `borderColor: Colors.secondary`, `paddingHorizontal: 15`. Haptics on press.

### `<IconButton>` — Icon-only circular button

```ts
import { IconButton } from "@/components"
```

Props: `icon: ReactNode | SFSymbol`, `size?: number`. Style: `borderRadius: 100`, `padding: 5`. Scale animation 0.8 on press.

### `<IconSaveButton>` / `<IconBackButton>` / `<IconCloseButton>`

Positioned GlassView-wrapped icon buttons for modal headers:
- `IconSaveButton`: `position: absolute, top: 15, right: 15`, `borderRadius: 100`, `padding: 15`
- `IconBackButton`: `position: absolute, top: 15, left: 15`, `borderRadius: 100`
- `IconCloseButton`: `width: 32, height: 32, borderRadius: 100`

### `<Button2>` — GlassView pressable button

Glass-backed button with `borderRadius: 15`. Use for secondary actions in modals.

---

### `<GlassIconButton>` — unified glass circle icon button

```ts
import { GlassIconButton } from "@/components"
```

Replaces `IconBackButton`, `IconSaveButton`, `IconCloseButton`. Single consistent API:

```tsx
<GlassIconButton name="x" onPress={navigation.goBack} positioned="top-left" />
<GlassIconButton name="check" onPress={save} positioned="top-right" tintColor={Colors.secondary} loading={saving} />
<GlassIconButton name="trash-2" onPress={handleDelete} color={Colors.error} />
```

Props: `name` (Feather), `size`, `color`, `tintColor`, `disabled`, `loading`, `positioned` (`"top-left" | "top-right"`), `padding`, `hitSlop`, `style`.

### `<GlassButton>` — glass text CTA

```ts
import { GlassButton } from "@/components"
```

```tsx
<GlassButton label="Save" icon="check" onPress={save} variant="accent" />
<GlassButton label="Delete" icon="trash-2" variant="destructive" loading={deleting} />
<GlassButton label="Cancel" onPress={dismiss} />
```

Variants: `default` | `accent` | `destructive`. Props: `label`, `icon`, `iconRight`, `variant`, `disabled`, `loading`, `fullWidth`.

### `<ModalHeader>` — standardized modal top bar

```ts
import { ModalHeader } from "@/components"
```

```tsx
<ModalHeader
  onClose={navigation.goBack}
  title="Edit Event"
  onSave={handleSubmit}
  saveDisabled={!isValid}
  saveLoading={isSubmitting}
/>
```

Props: `onClose`, `closeIcon`, `title`, `onSave`, `saveLabel`, `saveIcon`, `saveDisabled`, `saveLoading`, `padTop`.

### `<Hint>` — inline contextual message

```ts
import { Hint } from "@/components"
```

```tsx
<Hint text="Changes apply to all occurrences" variant="warning" />
<Hint text="This cannot be undone" variant="error" />
<Hint text="Saved automatically" variant="success" />
```

Variants: `info` | `warning` | `error` | `success`. Each has its own icon and color.

### `<ConfirmDialog>` — unified confirm / destructive dialog

```ts
import { ConfirmDialog } from "@/components"
```

```tsx
<ConfirmDialog
  isVisible={showDelete}
  onDismiss={() => setShowDelete(false)}
  onConfirm={handleDelete}
  title="Delete Event"
  description="This cannot be undone."
  destructive
  loading={deleting}
/>
```

Props: `isVisible`, `onDismiss`, `onConfirm`, `title`, `description`, `confirmLabel`, `cancelLabel`, `destructive`, `loading`.

**Always use this instead of `Alert.alert` for destructive/confirm flows.**

### Named Text exports

```ts
import { Heading, Title, SubHeading, Subtitle, Body, Caption } from "@/components"
// instead of:
import Text from "@/components/ui/Text/Text"
<Text variant="title">...</Text>
// use:
<Title>...</Title>
```

---

## 8. Selector / Toggle Components

### `<GroupSelector>` — Tab switcher (2–3 options)

```ts
import GroupSelector from "@/components/ui/GroupSelector"
```

Container: `borderRadius: 25`, `backgroundColor: Colors.primary_lighter`, `padding: 10`, `height: 55`.
Segments: `borderRadius: 9`, selected = white shadow + `fontWeight: 600`.

```tsx
<GroupSelector
  options={["Expense", "Income", "Refund"]}
  value={type}
  onChange={(v) => setType(v)}
/>
```

### `<SegmentedButtons>` — Inline option pills

```ts
import SegmentedButtons from "@/components/ui/SegmentedButtons"
```

Used for reminder picker, etc. Each segment is a pill; active = `Colors.secondary` bg.

```tsx
<SegmentedButtons
  value={selected}
  onChange={setValue}
  buttons={[
    { text: "Off", value: "" },
    { text: "15m", value: "15" },
  ]}
/>
```

---

## 9. Animations

All animations use `react-native-reanimated`. Key patterns:

### Scroll-reactive header

```ts
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
const [scrollY, onScroll] = useTrackScroll()
// pass scrollY to <Header animated scrollY={scrollY} />
// pass onScroll to ScrollView/FlatList onScroll prop
```

### Enter/exit animations (view switching)

```ts
const enterAnim = new Keyframe({ 0: { opacity: 0, transform: [{ scale: 0.93 }] }, 100: { opacity: 1, transform: [{ scale: 1 }] } }).duration(150)
const exitAnim = new Keyframe({ 0: { opacity: 1 }, 100: { opacity: 0, transform: [{ scale: 0.96 }] } }).duration(100)

<Animated.View key={activeKey} entering={enterAnim} exiting={exitAnim}>
```

### Shake (invalid input feedback)

```ts
const transformX = useSharedValue(0)
// shake sequence: 15 → -15 → 0 with spring, damping 2, stiffness 200, mass 0.5
```

### Scale press feedback (used in Card, IconButton)

```ts
// 0.97 scale, 100ms on press — Card
// 0.8 scale, 200ms on press → 1.0, 100ms release — IconButton
```

### FadeOut overlay

```ts
<Animated.View exiting={FadeOut.duration(250).delay(250)} style={StyleSheet.absoluteFillObject}>
  <LoaderSkeleton />
</Animated.View>
```

---

## 10. Glass / Blur Pattern

Glass elements appear throughout for depth. Pattern:

```tsx
<GlassView style={{ padding: 7.5, paddingHorizontal: 15, borderRadius: 100 }}>
  <Text>...</Text>
</GlassView>
```

Used for: header title pills, floating bottom toolbars, icon save/back buttons, floating action areas.

Do **not** use solid `Colors.primary_light` backgrounds for floating elements — prefer `GlassView`.

---

## 11. Calendar Theme

Import directly when using `react-native-calendars`:

```ts
import { calendarTheme } from "@/constants/Colors"
<Calendar theme={calendarTheme} />
```

Key calendar mappings:
- Background: `primary_darker`
- Today: `secondary` text + `secondary @ 15%` bg
- Selected day: `secondary` bg
- Day header text: `secondary_light_1`
- Arrows: `secondary`

---

## 12. Floating Bottom Toolbar Pattern

Used in `TimelineDetails` and `Expense` screens. Pattern:

```tsx
<View style={{ position: "absolute", left: 15, right: 15, bottom: 15 }} pointerEvents="box-none">
  <GlassView style={{ paddingVertical: 10, paddingHorizontal: 4, borderRadius: 100, flexDirection: "row" }}>
    {/* Toolbar buttons */}
  </GlassView>
</View>
```

Each toolbar button: `flex: 1`, centered, icon + label below (fontSize 9, `Colors.foreground_secondary`).

---

## 13. Status Badge Pattern

Reusable badge shape used in timeline items, wallet items:

```ts
{
  padding: 2.5,
  paddingHorizontal: 10,
  borderRadius: 100,
  alignSelf: "flex-end",
  backgroundColor: Colors.secondary,   // default / "to do"
}
// overrides:
backgroundColor: "lightgreen"   // completed
backgroundColor: "#BA4343"      // late / expired / error
backgroundColor: "#FF3B30"      // high priority
backgroundColor: "#007AFF"      // medium priority
backgroundColor: "#34C759"      // low priority
```

---

## 14. Context Menu Pattern

Long-press context menus use `react-native-context-menu-view`. Standard action order:

1. Primary positive action (Start Activity, Complete)
2. Neutral actions (Copy, Edit)
3. Destructive action last with `destructive: true` (Delete)

```tsx
<ContextMenu
  actions={items}
  previewBackgroundColor={Colors.primary_lighter}
  onPress={(e) => items[e.nativeEvent.index]?.onPress?.()}
>
  <Pressable onPress={onPress}>
    <Card>...</Card>
  </Pressable>
</ContextMenu>
```

---

## 15. Screen Structure Template

```tsx
export default function MyScreen() {
  const [scrollY, onScroll] = useTrackScroll()
  const insets = useSafeAreaInsets()

  return (
    <View style={{ flex: 1 }}>
      <Background />

      <Header
        animated
        scrollY={scrollY}
        animatedTitle="Screen Title"
        buttons={[...]}
      />

      <Animated.ScrollView
        onScroll={onScroll}
        contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* content */}
      </Animated.ScrollView>

      {/* Optional floating toolbar */}
    </View>
  )
}
```

Modal screens (presented via `presentation: "modal"`):

```tsx
<View style={{ flex: 1, paddingBottom: insets.bottom }}>
  <IconBackButton style={{ position: "absolute", top: 15, left: 15, zIndex: 100 }} />
  <IconSaveButton onPress={handleSubmit} disabled={!isValid} />
  <ScrollView contentContainerStyle={{ padding: 15, paddingTop: 80 }}>
    {/* form content */}
  </ScrollView>
</View>
```

---

## 16. Do / Don't

| Do | Don't |
|---|---|
| `Colors.secondary` for all CTAs and interactive highlights | Hardcode hex for accent colors |
| `Colors.primary_lighter` for card/list item backgrounds | Use white or light backgrounds |
| `borderRadius: 25` for cards | Mix different card radii inconsistently |
| `borderRadius: 100` for buttons, icons, badges | Use `borderRadius: 50` for pills (use 100) |
| `GlassView` for floating elements | `Colors.primary_light` solid bg on floating layers |
| `<Text variant="...">` or named exports (`<Title>`, `<Body>` etc.) | Bare `<RNText>` |
| `Padding.l` (15) as default content padding | Padding < 10 on screen edges |
| `Colors.foreground_secondary` for meta/secondary text | `"gray"` for secondary text (use `Colors.text_dark` for placeholders) |
| `Color(color).alpha(0.2).string()` for tinted backgrounds | Hardcode `rgba(...)` strings |
| `useTrackScroll()` + animated `Header` | Non-animated headers on content screens |
| `<GlassIconButton>` for all glass circle icon buttons | Ad-hoc `Pressable + GlassView + AntDesign` combos |
| `<ModalHeader>` for all modal top bars | Custom header layouts inside modals |
| `<ConfirmDialog>` for destructive/confirm flows | `Alert.alert` for destructive actions |
| `Feather` from `@expo/vector-icons` | Any other icon library (AntDesign, Ionicons, etc.) |
| System font (no `fontFamily`) | Explicit `fontFamily` unless app loads a custom font |
