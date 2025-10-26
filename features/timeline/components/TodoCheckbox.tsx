import { ActivityIndicator, View } from "react-native"
import Checkbox from "@/components/ui/Checkbox"
import Colors from "@/constants/Colors"

interface TodoCheckboxProps {
    isCompleted: boolean
    isLoading: boolean
    completeLoading: boolean
    removeLoading: boolean
    onToggleComplete: () => void
}

export const TodoCheckbox = ({
    isCompleted,
    isLoading,
    completeLoading,
    removeLoading,
    onToggleComplete,
}: TodoCheckboxProps) => {
    return (
        <View style={{ marginRight: 0 }}>
            {isLoading ? (
                <>
                    {completeLoading && <ActivityIndicator size="small" color={Colors.secondary} />}
                    {removeLoading && <ActivityIndicator size="small" color={Colors.error} />}
                </>
            ) : (
                <Checkbox checked={isCompleted} onPress={onToggleComplete} size={28} />
            )}
        </View>
    )
}