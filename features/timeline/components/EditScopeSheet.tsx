import { BottomSheetGorhom } from "@/components/ui/BottomSheet/BottomSheet"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import Text from "@/components/ui/Text/Text"
import BottomSheetType, { BottomSheetView } from "@gorhom/bottom-sheet"
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet"
import { forwardRef, useCallback, useMemo } from "react"
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native"

interface EditScopeSheetProps {
    onScopeSelected: (scope: "THIS_ONLY" | "ALL") => void
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 12,
    },
    option: {
        backgroundColor: Colors.primary_lighter,
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
})

const EditScopeSheet = forwardRef<BottomSheetType, EditScopeSheetProps>(({ onScopeSelected }, ref) => {
    const { height } = useWindowDimensions()

    const snapPoints = useMemo(() => [height * 0.38], [height])

    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
        [],
    )

    return (
        <BottomSheetGorhom
            ref={ref}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={{ backgroundColor: "#fff" }}
            handleStyle={{ backgroundColor: Colors.primary }}
            backgroundStyle={{ backgroundColor: Colors.primary }}
        >
            <BottomSheetView style={{ flex: 1, backgroundColor: Colors.primary }}>
                <View style={styles.container}>
                    <Text size={18} weight="bold" color={Colors.secondary} style={{ marginBottom: 8 }}>Edit repeating event</Text>

                    <Pressable style={styles.option} onPress={() => onScopeSelected("THIS_ONLY")}>
                        <Feather name="calendar" size={22} color={Colors.secondary} />
                        <View style={{ flex: 1 }}>
                            <Text size={15} weight="600" flex={1}>Edit only this occurrence</Text>
                            <Text size={13} color="gray" style={{ marginTop: 2 }}>Changes apply to this date only</Text>
                        </View>
                    </Pressable>

                    <Pressable style={styles.option} onPress={() => onScopeSelected("ALL")}>
                        <Feather name="refresh-cw" size={22} color={Colors.secondary} />
                        <View style={{ flex: 1 }}>
                            <Text size={15} weight="600" flex={1}>Edit all events in series</Text>
                            <Text size={13} color="gray" style={{ marginTop: 2 }}>Changes apply to all occurrences</Text>
                        </View>
                    </Pressable>
                </View>
            </BottomSheetView>
        </BottomSheetGorhom>
    )
})

export default EditScopeSheet
