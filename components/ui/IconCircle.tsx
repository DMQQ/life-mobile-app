import { Feather } from "@expo/vector-icons"
import { StyleSheet, View } from "react-native"

interface IconCircleProps {
    name: React.ComponentProps<typeof Feather>["name"]
    size?: number
    color: string
    backgroundColor: string
    containerSize?: number
}

export default function IconCircle({ name, size = 14, color, backgroundColor, containerSize = 32 }: IconCircleProps) {
    return (
        <View
            style={[
                styles.circle,
                {
                    width: containerSize,
                    height: containerSize,
                    borderRadius: containerSize / 2,
                    backgroundColor,
                },
            ]}
        >
            <Feather name={name} size={size} color={color} />
        </View>
    )
}

const styles = StyleSheet.create({
    circle: {
        alignItems: "center",
        justifyContent: "center",
    },
})
