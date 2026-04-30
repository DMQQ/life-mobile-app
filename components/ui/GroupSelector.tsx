import { useRef } from "react"
import { Animated, Pressable, StyleSheet, Text } from "react-native"
import theme from "@/constants/Colors"
import GlassView from "./GlassView"

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
        <GlassView style={styles.container}>
            {options.map((option, i) => {
                const selected = option === value
                return (
                    <GlassView
                        key={option + "-" + selected}
                        style={[styles.segmentWrapper, selected && { zIndex: 1 }]}
                        tintColor={selected ? theme.secondary : theme.primary_lighter}
                        interactive
                    >
                        <Pressable
                            onPress={() => handlePress(option, i)}
                            style={({ pressed }) => [
                                styles.segment,
                                selected && styles.selected,
                                pressed && { transform: [{ scale: 0.97 }] },
                            ]}
                        >
                            <Text style={[styles.label, selected && styles.labelSelected]}>{option}</Text>
                        </Pressable>
                    </GlassView>
                )
            })}
        </GlassView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: theme.primary_lighter,
        borderRadius: 25,
        padding: 10,
        gap: 5,
        height: 55,
    },
    segmentWrapper: {
        flex: 1,
        borderRadius: 15,
    },
    segment: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 9,
    },
    selected: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
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
