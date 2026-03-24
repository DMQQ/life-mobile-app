import { BottomSheetGorhom } from "@/components/ui/BottomSheet/BottomSheet"
import Colors from "@/constants/Colors"
import { AntDesign } from "@expo/vector-icons"
import BottomSheetType, { BottomSheetView } from "@gorhom/bottom-sheet"
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet"
import { forwardRef, useCallback, useMemo } from "react"
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native"

interface EditScopeSheetProps {
    onScopeSelected: (scope: "THIS_ONLY" | "ALL") => void
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 12,
    },
    title: {
        color: Colors.secondary,
        fontWeight: "bold",
        fontSize: 18,
        marginBottom: 8,
    },
    option: {
        backgroundColor: Colors.primary_lighter,
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    optionText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
        flex: 1,
    },
    optionSubtext: {
        color: "gray",
        fontSize: 13,
        marginTop: 2,
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
                    <Text style={styles.title}>Edit repeating event</Text>

                    <Pressable style={styles.option} onPress={() => onScopeSelected("THIS_ONLY")}>
                        <AntDesign name="calendar" size={22} color={Colors.secondary} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.optionText}>Edit only this occurrence</Text>
                            <Text style={styles.optionSubtext}>Changes apply to this date only</Text>
                        </View>
                    </Pressable>

                    <Pressable style={styles.option} onPress={() => onScopeSelected("ALL")}>
                        <AntDesign name="sync" size={22} color={Colors.secondary} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.optionText}>Edit all events in series</Text>
                            <Text style={styles.optionSubtext}>Changes apply to all occurrences</Text>
                        </View>
                    </Pressable>
                </View>
            </BottomSheetView>
        </BottomSheetGorhom>
    )
})

export default EditScopeSheet
