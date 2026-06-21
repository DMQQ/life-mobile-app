import { Expense as ExpenseType } from "@/types"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useState } from "react"
import { View } from "react-native"
import Colors from "@/constants/Colors"
import { IconButton } from "@/components"
import WalletItem from "../Wallet/WalletItem"
import SimilarExpensesChart from "./SimilarExpensesChart"
import Section from "@/components/ui/Section"

export default function SimilarExpenses({
    similarExpenses,
    selected,
    tint,
}: {
    similarExpenses: ExpenseType[]
    selected: ExpenseType
    tint?: string
}) {
    const navigation = useNavigation<any>()
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <View style={{ paddingHorizontal: 15 }}>
            <Section
                title="Similar"
                tint={tint}
                headerRight={
                    <IconButton
                        icon={
                            <Feather
                                name={isExpanded ? "chevron-up" : "chevron-down"}
                                size={11}
                                color={Colors.text_dark}
                            />
                        }
                        onPress={() => setIsExpanded(!isExpanded)}
                    />
                }
            >
                <SimilarExpensesChart expenses={similarExpenses} currentExpenseId={selected?.id} tint={tint} />

                {isExpanded && (
                    <View
                        style={{
                            borderRadius: 20,
                            overflow: "hidden",
                        }}
                    >
                        {similarExpenses.map((item: any) => (
                            <WalletItem
                                key={item.id}
                                {...item}
                                handlePress={() => {
                                    navigation.push("Expense", {
                                        expense: item,
                                    })
                                }}
                                containerStyle={{ backgroundColor: undefined }}
                            />
                        ))}
                    </View>
                )}
            </Section>
        </View>
    )
}
