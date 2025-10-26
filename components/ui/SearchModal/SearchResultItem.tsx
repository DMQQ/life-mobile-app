import React from "react"
import { StyleSheet, View } from "react-native"
import { AntDesign } from "@expo/vector-icons"
import Ripple from "react-native-material-ripple"
import Colors from "@/constants/Colors"
import Text from "../Text/Text"
import { SearchItem } from "./SearchModal"

interface SearchResultItemProps<T extends SearchItem = SearchItem> {
    item: T
    isSelected: boolean
    onPress: () => void
    multiSelect?: boolean
}

export default function SearchResultItem<T extends SearchItem = SearchItem>({
    item,
    isSelected,
    onPress,
    multiSelect = false,
}: SearchResultItemProps<T>) {
    return (
        <Ripple
            onPress={onPress}
            style={[
                styles.container,
                isSelected && styles.selectedContainer
            ]}
            rippleColor={Colors.secondary}
            rippleOpacity={0.2}
        >
            <View style={styles.content}>
                {item.icon && (
                    <View style={styles.iconContainer}>
                        {item.icon}
                    </View>
                )}
                
                <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={1}>
                        {item.title}
                    </Text>
                    
                    {item.subtitle && (
                        <Text style={styles.subtitle} numberOfLines={1}>
                            {item.subtitle}
                        </Text>
                    )}
                    
                    {item.description && (
                        <Text style={styles.description} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                </View>
                
                {multiSelect && (
                    <View style={styles.checkboxContainer}>
                        <View style={[
                            styles.checkbox,
                            isSelected && styles.checkboxSelected
                        ]}>
                            {isSelected && (
                                <AntDesign 
                                    name="check" 
                                    size={14} 
                                    color={Colors.foreground} 
                                />
                            )}
                        </View>
                    </View>
                )}
                
                {!multiSelect && (
                    <View style={styles.arrowContainer}>
                        <AntDesign 
                            name="right" 
                            size={16} 
                            color={Colors.foreground_secondary} 
                        />
                    </View>
                )}
            </View>
        </Ripple>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 4,
        borderRadius: 12,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        overflow: "hidden",
    },
    selectedContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderColor: Colors.secondary,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    iconContainer: {
        marginRight: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    textContainer: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.foreground,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.foreground_secondary,
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        color: Colors.foreground_disabled,
        lineHeight: 18,
    },
    checkboxContainer: {
        marginLeft: 8,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.foreground_secondary,
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxSelected: {
        backgroundColor: Colors.secondary,
        borderColor: Colors.secondary,
    },
    arrowContainer: {
        marginLeft: 8,
    },
})