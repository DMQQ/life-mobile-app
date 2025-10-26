import React, { useCallback, useContext, useEffect, useState } from "react"
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native"
import { AntDesign } from "@expo/vector-icons"
import Haptics from "react-native-haptic-feedback"
import Colors from "@/constants/Colors"
import Text from "../Text/Text"
import { SearchItem } from "./SearchModal"
import { SearchContext } from "./SearchContext"
import SearchResultItem from "./SearchResultItem"

interface SearchResultsProps<T extends SearchItem = SearchItem> {
    searchFunction?: (query: string) => Promise<T[]> | T[]
    data?: T[]
    onItemPress: (item: T) => void
    isItemSelected: (item: T) => boolean
    emptyStateMessage?: string
    emptyStateIcon?: React.ReactNode
    loading?: boolean
    renderItem?: (item: T, isSelected: boolean, onPress: () => void) => React.ReactNode
    multiSelect?: boolean
}

export default function SearchResults<T extends SearchItem = SearchItem>({
    searchFunction,
    data = [],
    onItemPress,
    isItemSelected,
    emptyStateMessage = "No results found",
    emptyStateIcon,
    loading: externalLoading = false,
    renderItem,
    multiSelect = false,
}: SearchResultsProps<T>) {
    const { query, loading: contextLoading, setLoading } = useContext(SearchContext)
    const [results, setResults] = useState<T[]>(data)
    const [error, setError] = useState<string | null>(null)
    
    const loading = externalLoading || contextLoading
    
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchFunction && !data.length) return
        
        try {
            setError(null)
            setLoading(true)
            
            let searchResults: T[]
            
            if (searchFunction) {
                const result = await Promise.resolve(searchFunction(searchQuery))
                searchResults = result
            } else {
                // Filter local data
                searchResults = data.filter(item => {
                    const searchText = searchQuery.toLowerCase()
                    return (
                        item.title.toLowerCase().includes(searchText) ||
                        item.subtitle?.toLowerCase().includes(searchText) ||
                        item.description?.toLowerCase().includes(searchText)
                    )
                })
            }
            
            setResults(searchResults)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Search failed")
            setResults([])
        } finally {
            setLoading(false)
        }
    }, [searchFunction, data, setLoading])
    
    useEffect(() => {
        if (query.trim()) {
            performSearch(query.trim())
        } else {
            setResults(data)
            setError(null)
        }
    }, [query, performSearch, data])
    
    const handleItemPress = useCallback((item: T) => {
        Haptics.trigger("impactLight")
        onItemPress(item)
    }, [onItemPress])
    
    const renderResultItem = useCallback(({ item }: { item: T }) => {
        const isSelected = isItemSelected(item)
        
        if (renderItem) {
            return renderItem(item, isSelected, () => handleItemPress(item))
        }
        
        return (
            <SearchResultItem
                item={item}
                isSelected={isSelected}
                onPress={() => handleItemPress(item)}
                multiSelect={multiSelect}
            />
        )
    }, [renderItem, isItemSelected, handleItemPress, multiSelect])
    
    const renderEmptyState = () => {
        if (loading) {
            return (
                <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color={Colors.secondary} />
                    <Text style={styles.emptyStateText}>Searching...</Text>
                </View>
            )
        }
        
        if (error) {
            return (
                <View style={styles.emptyState}>
                    <AntDesign name="exclamationcircle" size={48} color={Colors.error} />
                    <Text style={styles.emptyStateText}>Search Error</Text>
                    <Text style={styles.emptyStateSubtext}>{error}</Text>
                </View>
            )
        }
        
        if (query.trim() && results.length === 0) {
            return (
                <View style={styles.emptyState}>
                    {emptyStateIcon || <AntDesign name="search1" size={48} color={Colors.foreground_secondary} />}
                    <Text style={styles.emptyStateText}>{emptyStateMessage}</Text>
                    <Text style={styles.emptyStateSubtext}>
                        Try adjusting your search terms
                    </Text>
                </View>
            )
        }
        
        if (!query.trim()) {
            return (
                <View style={styles.emptyState}>
                    <AntDesign name="search1" size={48} color={Colors.foreground_secondary} />
                    <Text style={styles.emptyStateText}>Start typing to search</Text>
                </View>
            )
        }
        
        return null
    }
    
    const keyExtractor = useCallback((item: T) => item.id, [])
    
    return (
        <View style={styles.container}>
            <FlatList
                data={results}
                keyExtractor={keyExtractor}
                renderItem={renderResultItem}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={styles.list}
                contentContainerStyle={[
                    styles.listContent,
                    results.length === 0 && styles.emptyListContent
                ]}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: 200,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    emptyListContent: {
        flexGrow: 1,
        justifyContent: "center",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.foreground,
        marginTop: 16,
        textAlign: "center",
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: Colors.foreground_secondary,
        marginTop: 8,
        textAlign: "center",
    },
})