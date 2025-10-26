import React, { useCallback, useRef, useEffect } from "react"
import { Keyboard, StyleSheet, ViewStyle } from "react-native"
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import Overlay from "../Overlay/Overlay"
import SearchInput from "./SearchInput"
import SearchResults from "./SearchResults"
import { SearchProvider } from "./SearchContext"

export interface SearchItem {
    id: string
    title: string
    subtitle?: string
    description?: string
    icon?: React.ReactNode
    data?: any
}

export interface SearchModalProps<T extends SearchItem = SearchItem> {
    isVisible: boolean
    onDismiss: () => void
    onItemSelect?: (item: T) => void
    onMultiSelect?: (items: T[]) => void
    
    // Search configuration
    placeholder?: string
    searchFunction?: (query: string) => Promise<T[]> | T[]
    data?: T[]
    
    // Customization
    title?: string
    emptyStateMessage?: string
    emptyStateIcon?: React.ReactNode
    
    // Behavior
    multiSelect?: boolean
    selectedItems?: T[]
    autoFocus?: boolean
    debounceMs?: number
    
    // Styling
    containerStyle?: ViewStyle
    backgroundColor?: string
    overlayOpacity?: number
    
    // Loading
    loading?: boolean
    
    // Custom rendering
    renderItem?: (item: T, isSelected: boolean, onPress: () => void) => React.ReactNode
    renderHeader?: () => React.ReactNode
    renderFooter?: () => React.ReactNode
}

export default function SearchModal<T extends SearchItem = SearchItem>({
    isVisible,
    onDismiss,
    onItemSelect,
    onMultiSelect,
    placeholder = "Search...",
    searchFunction,
    data = [],
    title,
    emptyStateMessage = "No results found",
    emptyStateIcon,
    multiSelect = false,
    selectedItems = [],
    autoFocus = true,
    debounceMs = 300,
    containerStyle,
    backgroundColor = Colors.primary_light,
    overlayOpacity = 0.7,
    loading = false,
    renderItem,
    renderHeader,
    renderFooter,
}: SearchModalProps<T>) {
    const searchInputRef = useRef<any>(null)
    
    useEffect(() => {
        if (isVisible && autoFocus) {
            // Delay focus to ensure modal is fully visible
            setTimeout(() => {
                searchInputRef.current?.focus()
            }, 100)
        }
    }, [isVisible, autoFocus])
    
    const handleDismiss = useCallback(() => {
        Keyboard.dismiss()
        onDismiss()
    }, [onDismiss])
    
    const handleItemPress = useCallback((item: T) => {
        if (multiSelect) {
            const isSelected = selectedItems.some(selectedItem => selectedItem.id === item.id)
            let newSelection: T[]
            
            if (isSelected) {
                newSelection = selectedItems.filter(selectedItem => selectedItem.id !== item.id)
            } else {
                newSelection = [...selectedItems, item]
            }
            
            onMultiSelect?.(newSelection)
        } else {
            onItemSelect?.(item)
            handleDismiss()
        }
    }, [multiSelect, selectedItems, onMultiSelect, onItemSelect, handleDismiss])
    
    const isItemSelected = useCallback((item: T) => {
        return selectedItems.some(selectedItem => selectedItem.id === item.id)
    }, [selectedItems])
    
    return (
        <Overlay
            isVisible={isVisible}
            onClose={handleDismiss}
            opacity={overlayOpacity}
        >
            <SearchProvider>
                <Animated.View
                    entering={FadeInDown.duration(300)}
                    exiting={FadeOutDown.duration(200)}
                    style={[
                        styles.container,
                        {
                            backgroundColor,
                            width: Layout.screen.width - 20,
                            maxHeight: Layout.screen.height * 0.9,
                        },
                        containerStyle,
                    ]}
                >
                    {renderHeader?.()}
                    
                    <SearchInput
                        ref={searchInputRef}
                        placeholder={placeholder}
                        onDismiss={handleDismiss}
                        title={title}
                        debounceMs={debounceMs}
                    />
                    
                    <SearchResults
                        searchFunction={searchFunction}
                        data={data}
                        onItemPress={handleItemPress}
                        isItemSelected={isItemSelected}
                        emptyStateMessage={emptyStateMessage}
                        emptyStateIcon={emptyStateIcon}
                        loading={loading}
                        renderItem={renderItem}
                        multiSelect={multiSelect}
                    />
                    
                    {renderFooter?.()}
                </Animated.View>
            </SearchProvider>
        </Overlay>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        overflow: "hidden",
        maxHeight: "90%",
    },
})