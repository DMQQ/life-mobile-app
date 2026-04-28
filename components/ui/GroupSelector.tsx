import { useRef } from "react"
import { Animated, Pressable, StyleSheet, Text, View } from "react-native"
import theme from "@/constants/Colors"
import { SymbolView } from "expo-symbols"

interface GroupSelectorProps<T extends string> {
    options: [T] | [T, T] | [T, T, T]
    value: T
    onChange: (value: T) => void
}

export default function GroupSelector<T extends string>({ options, value, onChange }: GroupSelectorProps<T>) {
    const anims = useRef(options.map(() => new Animated.Value(1))).current

    const handlePress = (option: T, index: number) => {
        if (option === value) return
        Animated.sequence([
            Animated.timing(anims[index], { toValue: 0.94, duration: 80, useNativeDriver: true }),
            Animated.timing(anims[index], { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start()
        onChange(option)
    }

    return (
        <View style={styles.container}>
            {options.map((option, i) => {
                const selected = option === value
                return (
                    <Animated.View key={option} style={[styles.segmentWrapper, { transform: [{ scale: anims[i] }] }]}>
                        <Pressable
                            onPress={() => handlePress(option, i)}
                            style={[styles.segment, selected && styles.selected]}
                        >
                            <Text style={[styles.label, selected && styles.labelSelected]}>{option}</Text>
                        </Pressable>
                    </Animated.View>
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: theme.primary_lighter,
        borderRadius: 15,
        padding: 7.5,
        gap: 5,
        height: 55,
    },
    segmentWrapper: {
        flex: 1,
    },
    segment: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 9,
    },
    selected: {
        backgroundColor: theme.secondary,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
        borderRadius: 10,
    },
    label: {
        fontSize: 13,
        fontWeight: "500",
        color: theme.foreground_secondary,
        letterSpacing: -0.1,
    },
    labelSelected: {
        color: theme.foreground,
        fontWeight: "600",
    },
})
