import React, { forwardRef, useCallback, useContext, useEffect, useState } from "react"
import { StyleSheet, TextInput, View } from "react-native"
import { AntDesign } from "@expo/vector-icons"
import Haptics from "react-native-haptic-feedback"
import Colors from "@/constants/Colors"
import Text from "../Text/Text"
import IconButton from "../IconButton/IconButton"
import GlassView from "../GlassView"
import { SearchContext } from "./SearchContext"

interface SearchInputProps {
    placeholder?: string
    onDismiss: () => void
    title?: string
    debounceMs?: number
}

const SearchInput = forwardRef<TextInput, SearchInputProps>(({
    placeholder = "Search...",
    onDismiss,
    title,
    debounceMs = 300,
}, ref) => {
    const { query, setQuery } = useContext(SearchContext)
    const [localQuery, setLocalQuery] = useState(query)
    
    useEffect(() => {
        const timeout = setTimeout(() => {
            setQuery(localQuery)
        }, debounceMs)
        
        return () => clearTimeout(timeout)
    }, [localQuery, debounceMs, setQuery])
    
    useEffect(() => {
        setLocalQuery(query)
    }, [query])
    
    const handleClear = useCallback(() => {
        Haptics.trigger("impactLight")
        setLocalQuery("")
        setQuery("")
    }, [setQuery])
    
    return (
        <View style={styles.container}>
            {title && (
                <View style={styles.header}>
                    <Text variant="subheading" style={styles.title}>
                        {title}
                    </Text>
                    <IconButton
                        icon={<AntDesign name="close" size={24} color={Colors.foreground_secondary} />}
                        onPress={onDismiss}
                        style={styles.closeButton}
                    />
                </View>
            )}
            
            <View style={styles.searchContainer}>
                <GlassView style={styles.searchInputContainer}>
                    <View style={styles.searchIconContainer}>
                        <AntDesign 
                            name="search" 
                            size={20} 
                            color={Colors.foreground_secondary} 
                        />
                    </View>
                    
                    <TextInput
                        ref={ref}
                        value={localQuery}
                        onChangeText={setLocalQuery}
                        placeholder={placeholder}
                        placeholderTextColor={Colors.foreground_secondary}
                        style={styles.textInput}
                        returnKeyType="search"
                        autoCapitalize="none"
                        autoCorrect={false}
                        clearButtonMode="never"
                    />
                    
                    {localQuery.length > 0 && (
                        <IconButton
                            icon={<AntDesign name="close" size={18} color={Colors.foreground_secondary} />}
                            onPress={handleClear}
                            style={styles.clearButton}
                        />
                    )}
                </GlassView>
            </View>
        </View>
    )
})

SearchInput.displayName = "SearchInput"

const styles = StyleSheet.create({
    container: {
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    title: {
        color: Colors.foreground,
        fontSize: 24,
        fontWeight: "bold",
    },
    closeButton: {
        padding: 8,
    },
    searchContainer: {
        marginBottom: 10,
    },
    searchInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    searchIconContainer: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.foreground,
        paddingVertical: 0,
    },
    clearButton: {
        padding: 4,
        marginLeft: 8,
    },
})

export default SearchInput