# SearchModal Component

A reusable, transparent modal screen for displaying and searching through different types of data with support for both single and multi-selection.

## Features

- 🔍 **Debounced Search**: Optimized search with configurable debounce timing
- 🎨 **Glass Effect Styling**: Beautiful transparent design matching app theme
- 📱 **Bottom Tab Integration**: Search input positioned in bottom tab for easy access
- 🔄 **Async & Sync Search**: Support for both local filtering and API-based search
- ✅ **Multi-Selection**: Optional multi-select with visual feedback
- 🎭 **Custom Rendering**: Customizable item rendering and empty states
- 📲 **Haptic Feedback**: Native haptic feedback on interactions
- ♿ **Accessibility**: Full screen reader support
- 🎬 **Smooth Animations**: React Native Reanimated animations

## Basic Usage

```tsx
import { SearchModal, useSearchModal, SearchItem } from "@/components/ui/SearchModal"

// Define your data type
interface MyItem extends SearchItem {
  customProperty: string
}

// In your component
const searchModal = useSearchModal<MyItem>({
  onSelect: (item) => {
    console.log("Selected:", item)
  }
})

// Render the modal
<SearchModal
  isVisible={searchModal.isVisible}
  onDismiss={searchModal.hide}
  onItemSelect={searchModal.handleItemSelect}
  title="Search Items"
  data={myData}
/>
```

## Props

### SearchModalProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isVisible` | `boolean` | - | Controls modal visibility |
| `onDismiss` | `() => void` | - | Called when modal is dismissed |
| `onItemSelect` | `(item: T) => void` | - | Single selection handler |
| `onMultiSelect` | `(items: T[]) => void` | - | Multi-selection handler |
| `title` | `string` | - | Modal title |
| `placeholder` | `string` | "Search..." | Search input placeholder |
| `searchFunction` | `(query: string) => Promise<T[]> \| T[]` | - | Custom search function |
| `data` | `T[]` | `[]` | Static data to search through |
| `multiSelect` | `boolean` | `false` | Enable multi-selection |
| `selectedItems` | `T[]` | `[]` | Currently selected items |
| `autoFocus` | `boolean` | `true` | Auto-focus search input |
| `debounceMs` | `number` | `300` | Search debounce delay |
| `emptyStateMessage` | `string` | "No results found" | Empty state text |
| `emptyStateIcon` | `React.ReactNode` | - | Empty state icon |
| `loading` | `boolean` | `false` | External loading state |
| `renderItem` | `(item: T, isSelected: boolean, onPress: () => void) => React.ReactNode` | - | Custom item renderer |
| `renderHeader` | `() => React.ReactNode` | - | Custom header renderer |
| `renderFooter` | `() => React.ReactNode` | - | Custom footer renderer |

## Hook API

### useSearchModal

```tsx
const {
  isVisible,
  selectedItems,
  show,
  hide,
  handleItemSelect,
  handleMultiSelect,
  clearSelection,
  addToSelection,
  removeFromSelection,
  toggleSelection,
  isSelected,
  selectedCount
} = useSearchModal(options)
```

## Examples

### 1. Simple Single Selection

```tsx
const exerciseSearch = useSearchModal({
  onSelect: (exercise) => {
    console.log("Selected exercise:", exercise.title)
  }
})

<SearchModal
  isVisible={exerciseSearch.isVisible}
  onDismiss={exerciseSearch.hide}
  onItemSelect={exerciseSearch.handleItemSelect}
  title="Select Exercise"
  data={exercises}
/>
```

### 2. Multi-Selection with Custom Footer

```tsx
const peopleSearch = useSearchModal({
  multiSelect: true,
  onMultiSelect: (people) => {
    console.log("Selected people:", people)
  }
})

<SearchModal
  isVisible={peopleSearch.isVisible}
  onDismiss={peopleSearch.hide}
  onMultiSelect={peopleSearch.handleMultiSelect}
  selectedItems={peopleSearch.selectedItems}
  title="Select Team Members"
  data={people}
  multiSelect={true}
  renderFooter={() => (
    <View style={styles.footer}>
      <Text>{peopleSearch.selectedCount} selected</Text>
    </View>
  )}
/>
```

### 3. Async Search with API

```tsx
const searchFunction = async (query: string) => {
  const response = await fetch(`/api/search?q=${query}`)
  return response.json()
}

<SearchModal
  isVisible={modalVisible}
  onDismiss={() => setModalVisible(false)}
  onItemSelect={handleSelect}
  title="Search Products"
  searchFunction={searchFunction}
  placeholder="Search products..."
/>
```

### 4. Custom Item Rendering

```tsx
<SearchModal
  isVisible={modalVisible}
  onDismiss={() => setModalVisible(false)}
  onItemSelect={handleSelect}
  title="Custom Items"
  data={items}
  renderItem={(item, isSelected, onPress) => (
    <CustomSearchItem
      item={item}
      isSelected={isSelected}
      onPress={onPress}
    />
  )}
/>
```

## Data Structure

Your search items must extend the `SearchItem` interface:

```tsx
interface SearchItem {
  id: string
  title: string
  subtitle?: string
  description?: string
  icon?: React.ReactNode
  data?: any // Additional custom data
}
```

## Styling

The component uses the app's color system and supports custom styling through props:

- `containerStyle`: Modal container styling
- `backgroundColor`: Modal background color
- `overlayOpacity`: Overlay opacity (0-1)

## Integration

The SearchModal integrates seamlessly with:

- ✅ Redux/Context state management
- ✅ GraphQL queries (Apollo Client)
- ✅ REST API endpoints
- ✅ Local data filtering
- ✅ React Navigation
- ✅ Bottom Tab navigation

## Performance

- Debounced search input to reduce API calls
- FlatList with optimized rendering for large datasets
- Memoized components to prevent unnecessary re-renders
- Smooth animations with React Native Reanimated

## Accessibility

- Screen reader support
- Keyboard navigation
- Focus management
- ARIA labels
- High contrast support