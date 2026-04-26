import { Expense as ExpenseType } from "@/types"
import { AntDesign } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { ReactNode, useState } from "react"
import { Text, View } from "react-native"
import Colors from "@/constants/Colors"
import { IconButton } from "@/components"
import WalletItem from "../Wallet/WalletItem"
import SimilarExpensesChart from "./SimilarExpensesChart"

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

export default function SimilarExpenses({
    similarExpenses,
    selected,
}: {
    similarExpenses: ExpenseType[]
    selected: ExpenseType
}) {
    const navigation = useNavigation<any>()
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <View style={{ paddingHorizontal: 15, marginBottom: 25 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 7.5 }}>
                <IconButton
                    icon={<AntDesign name="down" size={16} color={Colors.foreground} />}
                    onPress={() => setIsExpanded(!isExpanded)}
                />
                <Txt size={20} color={Colors.foreground}>
                    Similar expenses
                </Txt>
            </View>
            <SimilarExpensesChart expenses={similarExpenses} currentExpenseId={selected?.id} />

            {isExpanded && (
                <View style={{ marginTop: 20 }}>
                    {similarExpenses.map((item: any) => (
                        <WalletItem
                            key={item.id}
                            {...item}
                            handlePress={() => {
                                navigation.push("Expense", {
                                    expense: item,
                                })
                            }}
                        />
                    ))}
                </View>
            )}
        </View>
    )
}
