import { Expense as ExpenseType } from "@/types"
import { AntDesign } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { ReactNode, useState } from "react"
import { Text, View } from "react-native"
import Colors from "@/constants/Colors"
import { IconButton } from "@/components"
import WalletItem from "../Wallet/WalletItem"
import SimilarExpensesChart from "./SimilarExpensesChart"
import Section from "@/components/ui/Section"

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
        <View style={{ paddingHorizontal: 15 }}>
            <Section
                title="Similar"
                headerRight={
                    <IconButton
                        icon={<AntDesign name="down" size={11} color={Colors.text_dark} />}
                        onPress={() => setIsExpanded(!isExpanded)}
                    />
                }
            >
                <SimilarExpensesChart expenses={similarExpenses} currentExpenseId={selected?.id} />

                {isExpanded && (
                    <View
                        style={{
                            backgroundColor: Colors.primary_lighter,
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
                                animatedStyle={{
                                    borderWidth: 0,
                                    marginBottom: 0,
                                    borderRadius: 0,
                                    borderBottomWidth: 1,
                                    marginTop: 0,
                                }}
                            />
                        ))}
                    </View>
                )}
            </Section>
        </View>
    )
}
