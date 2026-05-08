import { useRef } from "react"
import { Animated, Pressable, StyleSheet, Text } from "react-native"
import theme from "@/constants/Colors"
import GlassView from "./GlassView"

export interface GroupSelectorOption<V = string> {
    label: string
    value: V
}

interface GroupSelectorProps<V> {
    options: GroupSelectorOption<V>[]
    value: V
    onChange: (value: V) => void
}

export default function GroupSelector<V>({ options, value, onChange }: GroupSelectorProps<V>) {
    const anims = useRef(options.map(() => new Animated.Value(1))).current

    const handlePress = (option: GroupSelectorOption<V>, index: number) => {
        if (option.value === value) return
        Animated.sequence([
            Animated.timing(anims[index], { toValue: 0.94, duration: 80, useNativeDriver: true }),
            Animated.timing(anims[index], { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start()
        onChange(option.value)
    }

    return (
        <GlassView style={styles.container}>
            {options.map((option, i) => {
                const selected = option.value === value
                return (
                    <GlassView
                        key={String(option.value) + "-" + selected}
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
                            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
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
