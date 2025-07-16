import { IconButton } from "@/components"
import Input from "@/components/ui/TextInput/TextInput"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import lowOpacity from "@/utils/functions/lowOpacity"
import { AntDesign, Ionicons } from "@expo/vector-icons"
import Color from "color"
import { ActivityIndicator, StyleSheet, Text } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import { Icons } from "../Expense/ExpenseIcon"

interface NameInputProps {
    isInputFocused: boolean
    setIsInputFocused: (focused: boolean) => void
    name: string
    setName: (name: string) => void
    isSubExpenseMode: boolean
    handleToggleSubExpenseMode: () => void
    subexpenseSheetRef: React.RefObject<any>
    loading: boolean
    isValid: boolean
    prediction?: any
    canPredict?: boolean
    applyPrediction: () => void
    handleSubmit: () => void

    params?: {
        isEditing?: boolean
    }

    subExpensesLength: number
}

export default function NameInput({
    isInputFocused,
    setIsInputFocused,
    name,
    setName,
    isSubExpenseMode,
    handleToggleSubExpenseMode,
    subexpenseSheetRef,
    loading,
    isValid,
    prediction,
    canPredict,
    applyPrediction,
    handleSubmit,
    params,
    subExpensesLength = 0,
}: NameInputProps) {
    return (
        <Input
            containerStyle={{
                borderRadius: 25,
                backgroundColor: isInputFocused
                    ? Color(Colors.primary_light).lighten(0.25).hex()
                    : Colors.primary_light,
                borderColor: isInputFocused ? Color(Colors.primary).lighten(2.5).hex() : Colors.primary_lighter,
            }}
            placeholder={isSubExpenseMode ? "Add sub-expense" : "What are you spending on?"}
            style={styles.input}
            placeholderTextColor={"rgba(255,255,255,0.3)"}
            value={name}
            onChangeText={setName}
            onBlur={() => setIsInputFocused(false)}
            onFocus={() => setIsInputFocused(true)}
            left={
                <IconButton
                    onLongPress={() => {
                        Feedback.trigger("impactLight")
                        subexpenseSheetRef.current?.expand()
                    }}
                    icon={
                        isSubExpenseMode ? (
                            <Text
                                style={{
                                    width: 18,
                                    height: 18,
                                    textAlign: "center",
                                    color: "#fff",
                                    fontWeight: "900",
                                }}
                            >
                                {subExpensesLength}
                            </Text>
                        ) : (
                            <AntDesign name="switcher" size={18} color="rgba(255,255,255,0.7)" />
                        )
                    }
                    onPress={handleToggleSubExpenseMode}
                    style={{
                        backgroundColor: !isSubExpenseMode ? Colors.primary : Colors.secondary,
                        padding: 10,
                    }}
                />
            }
            right={
                <Ripple
                    onPress={!isValid && prediction ? applyPrediction : handleSubmit}
                    style={[
                        styles.save,
                        !isValid && {
                            backgroundColor: lowOpacity(styles.save.backgroundColor, 0.2),
                        },
                        !isValid &&
                            prediction && {
                                backgroundColor: Icons[prediction.category as keyof typeof Icons].backgroundColor,
                            },
                    ]}
                    disabled={!isValid && !prediction && !canPredict}
                >
                    {loading ? (
                        <ActivityIndicator size={14} color="#fff" />
                    ) : isValid ? (
                        <AntDesign
                            name="save"
                            size={20}
                            color={isValid || canPredict ? "#fff" : lowOpacity(Colors.secondary_light_1, 0.5)}
                        />
                    ) : (
                        <Ionicons
                            name="color-wand-sharp"
                            size={20}
                            color={isValid || canPredict ? "#fff" : lowOpacity(Colors.secondary_light_1, 0.5)}
                        />
                    )}
                    <Text
                        style={{
                            color:
                                isValid || (!isValid && prediction)
                                    ? "#fff"
                                    : lowOpacity(Colors.secondary_light_1, 0.5),
                            fontSize: 14,
                            fontWeight: "500",
                            lineHeight: 20,
                        }}
                    >
                        {isSubExpenseMode
                            ? "Add"
                            : params?.isEditing
                              ? "Edit"
                              : !isValid && prediction
                                ? "Use"
                                : "Done"}
                    </Text>
                </Ripple>
            }
        />
    )
}

const styles = StyleSheet.create({
    input: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 18,
        borderColor: Colors.secondary,
        flex: 1,
        width: Layout.screen.width - 30,
        borderRadius: 100,
    },
    save: {
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 8,
        backgroundColor: Colors.secondary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7.5,
    },
})
