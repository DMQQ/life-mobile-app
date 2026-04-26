import { Expense as ExpenseType } from "@/types"
import { AntDesign, MaterialIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { ReactNode } from "react"
import { StyleSheet, Text, View } from "react-native"
import Ripple from "react-native-material-ripple"
import Colors from "@/constants/Colors"
import { CategoryIcon, CategoryUtils } from "./ExpenseIcon"
import EditNote from "./EditNote"

const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1)

const Txt = (props: { children: ReactNode; size: number; color?: any }) => (
    <Text
        style={{
            color: props.color ?? Colors.secondary,
            fontSize: props.size,
            fontWeight: "bold",
            lineHeight: props.size + 7.5,
        }}
    >
        {props.children}
    </Text>
)

export default function ExpenseDetails({ expense }: { expense: ExpenseType }) {
    const navigation = useNavigation<any>()

    return (
        <View
            style={{
                marginTop: 20,
                paddingBottom: 20,
                backgroundColor: Colors.primary_light,
                borderRadius: 15,
            }}
        >
            {expense?.category && (
                <View style={[styles.row, { padding: 0, paddingRight: 10, paddingLeft: 7.5 }]}>
                    <CategoryIcon
                        type={expense?.type as "expense" | "income"}
                        category={(expense?.category || "none") as any}
                        clear
                    />

                    <Text style={{ color: Colors.secondary_light_2, fontSize: 18, flex: 1 }}>
                        {capitalize(CategoryUtils.getCategoryName(expense?.category || ""))}
                    </Text>

                    <Ripple
                        onPress={() =>
                            navigation.navigate("CorrectionMaps", {
                                prefill: {
                                    shop: expense?.shop || undefined,
                                    description: expense?.description || undefined,
                                    category: expense?.category || undefined,
                                    amount: expense?.amount || undefined,
                                },
                            })
                        }
                        style={styles.correctionBtn}
                    >
                        <AntDesign name="swap" size={12} color={Colors.secondary} />
                        <Text style={styles.correctionBtnText}>Fix rule</Text>
                    </Ripple>
                </View>
            )}

            <View style={styles.row}>
                <MaterialIcons
                    name="money"
                    size={24}
                    color={Colors.ternary}
                    style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                />

                <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>
                    {capitalize(expense?.type)}
                </Text>
            </View>

            <View style={styles.row}>
                <MaterialIcons
                    name="money"
                    size={24}
                    color={Colors.ternary}
                    style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                />

                <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>
                    Balance before: {expense?.balanceBeforeInteraction} zł
                </Text>
            </View>

            <EditNote expense={expense} />
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        borderRadius: 15,
        backgroundColor: Colors.primary_light,
        marginTop: 10,
    },
    correctionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 100,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
    },
    correctionBtnText: {
        color: Colors.secondary,
        fontSize: 12,
        fontWeight: "500",
    },
})
