import { IconButton } from "@/components"
import Input from "@/components/ui/TextInput/TextInput"
import Text from "@/components/ui/Text/Text"
import GlassView from "@/components/ui/GlassView"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import lowOpacity from "@/utils/functions/lowOpacity"
import { Icons } from "../Expense/ExpenseIcon"
import { AntDesign } from "@expo/vector-icons"
import { gql, useQuery } from "@apollo/client"
import Color from "color"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { useCreateExpenseContext } from "@/features/wallet/context/CreateExpenseContext"

const GET_EXPENSE_SUGGESTIONS = gql`
    query GetExpenseSuggestions($filters: GetWalletFilters, $take: Int) {
        wallet {
            expenses2(filters: $filters, take: $take) {
                expenses {
                    id
                    description
                    amount
                    category
                }
            }
        }
    }
`

interface Suggestion {
    id: string
    description: string
    amount: number
    category: string
}

export default function NameInput({ isEditing }: { isEditing?: boolean }) {
    const { state, methods, isInputFocused, setIsInputFocused, subexpenseSheetRef } = useCreateExpenseContext()
    const { name, isValid, prediction, isSubExpenseMode, SubExpenses } = state
    const { setName, handleToggleSubExpenseMode } = methods

    const [debouncedQuery, setDebouncedQuery] = useState(name)
    const [suppressed, setSuppressed] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(name), 300)
        return () => clearTimeout(t)
    }, [name])

    const { data } = useQuery(GET_EXPENSE_SUGGESTIONS, {
        variables: { filters: { title: debouncedQuery }, take: 6 },
        skip: !isInputFocused || debouncedQuery.trim().length < 2,
    })

    const expenses: Suggestion[] = data?.wallet?.expenses2?.flatMap((m: any) => m.expenses) ?? []
    const seen = new Set<string>()
    const queryLower = name.toLowerCase()
    const suggestions = expenses
        .filter((e) => {
            const key = e.description.toLowerCase()
            if (seen.has(key)) return false
            seen.add(key)
            return true
        })
        .filter((e) => e.description.toLowerCase().startsWith(queryLower) && e.description.toLowerCase() !== queryLower)
        .slice(0, 4)

    const topSuggestion = suggestions[0]
    const showSuggestion = isInputFocused && topSuggestion && !suppressed

    const bg = isInputFocused ? Color(Colors.primary_light).lighten(0.25).hex() : Colors.primary_lighter

    const borderColor = isInputFocused
        ? Color(Colors.primary).lighten(1.5).hex()
        : Color(Colors.primary_lighter).lighten(0.25).hex()

    const tintColor =
        !isValid && prediction
            ? Icons[prediction.category as keyof typeof Icons]?.backgroundColor
            : !isValid
              ? Colors.primary
              : Colors.secondary

    return (
        <View>
            {showSuggestion && (
                <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.suggestionPill}>
                    <GlassView style={styles.suggestionGlass}>
                        <Pressable
                            onPress={() => {
                                Feedback.trigger("impactLight")
                                setSuppressed(true)
                                setName(topSuggestion.description)
                            }}
                            style={styles.suggestionPressable}
                        >
                            <Text variant="caption" style={styles.suggestionLabel} numberOfLines={1}>
                                Apply
                            </Text>
                        </Pressable>
                    </GlassView>
                </Animated.View>
            )}

            <View>
                <View style={{ position: "relative" }}>
                    {showSuggestion && (
                        <Text style={styles.floatingSuggestion} numberOfLines={1}>
                            <Text style={{ color: "transparent" }}>{name}</Text>
                            {topSuggestion.description}
                        </Text>
                    )}
                    <Input
                        containerStyle={{
                            borderRadius: 20,
                            backgroundColor: bg,
                            borderColor,
                            marginBottom: 0,
                        }}
                        placeholder={isSubExpenseMode ? "Add sub-expense" : "What are you spending on?"}
                        style={styles.input}
                        placeholderTextColor={"rgba(255,255,255,0.3)"}
                        value={name}
                        onChangeText={(text) => {
                            setSuppressed(false)
                            setName(text)
                        }}
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
                                            variant="body"
                                            style={{
                                                width: 18,
                                                height: 18,
                                                textAlign: "center",
                                                color: Colors.foreground,
                                                fontWeight: "900",
                                            }}
                                        >
                                            {SubExpenses.length}
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
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    suggestionPill: {
        position: "absolute",
        bottom: "100%",
        alignSelf: "center",
        marginBottom: 8,
        zIndex: 10,
    },
    suggestionGlass: {
        borderRadius: 100,
    },
    suggestionPressable: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    suggestionLabel: {
        color: Colors.foreground,
        fontWeight: "600",
        maxWidth: 200,
    },
    floatingSuggestion: {
        position: "absolute",
        top: 16,
        left: 14,
        right: 80,
        bottom: 0,
        textAlignVertical: "center",
        color: "rgba(255,255,255,0.25)",
        fontSize: 18,
        zIndex: 12,
    },
    input: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 18,
        flex: 1,
        width: Layout.screen.width - 90,
        borderRadius: 100,
        zIndex: 11,
    },
    save: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 100,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7.5,
    },
})
