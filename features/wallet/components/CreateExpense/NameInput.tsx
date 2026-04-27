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
import { cloneElement, useEffect, useState } from "react"
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

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

const ITEM_HEIGHT = 36

interface Suggestion {
    id: string
    description: string
    amount: number
    category: string
}

interface NameInputProps {
    isInputFocused: boolean
    setIsInputFocused: (focused: boolean) => void
    name: string
    setName: (name: string) => void
    setAmount: (amount: string) => void
    setCategory: (category: keyof typeof Icons) => void
    isSubExpenseMode: boolean
    handleToggleSubExpenseMode: () => void
    subexpenseSheetRef: React.RefObject<any>
    loading: boolean
    isValid: boolean
    prediction?: any
    canPredict?: boolean
    applyPrediction: () => void
    handleSubmit: () => void
    params?: { isEditing?: boolean }
    subExpensesLength: number
}

export default function NameInput({
    isInputFocused,
    setIsInputFocused,
    name,
    setName,
    setAmount,
    setCategory,
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
    const suggestions = expenses
        .filter((e) => {
            const key = e.description.toLowerCase()
            if (seen.has(key)) return false
            seen.add(key)
            return true
        })
        .slice(0, 4)

    const showSuggestions = isInputFocused && suggestions.length > 0 && !suppressed

    const heightAnim = useSharedValue(0)

    useEffect(() => {
        heightAnim.value = withTiming(showSuggestions ? suggestions.length * ITEM_HEIGHT : 0, { duration: 100 })
    }, [showSuggestions, suggestions.length])

    const dropdownStyle = useAnimatedStyle(() => ({
        height: heightAnim.value,
        overflow: "hidden",
    }))

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
        <View style={styles.wrapper}>
            <Animated.View
                style={[
                    styles.dropdown,
                    { backgroundColor: bg, borderColor },
                    dropdownStyle,
                    {
                        borderWidth: showSuggestions ? 2 : 0,
                    },
                ]}
            >
                {suggestions.map((item, index) => {
                    const icon = Icons[item.category as keyof typeof Icons]?.icon
                    const isLast = index === suggestions.length - 1
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.item, !isLast && styles.itemBorder]}
                            onPress={() => {
                                setSuppressed(true)
                                setName(item.description)
                            }}
                            activeOpacity={0.9}
                        >
                            <View style={styles.iconWrap}>{icon && cloneElement(icon, { size: 13 })}</View>
                            <Text variant="body" style={styles.itemDescription} numberOfLines={1}>
                                {item.description}
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </Animated.View>

            <Input
                containerStyle={{
                    borderRadius: 20,
                    backgroundColor: bg,
                    borderColor,
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
                    <GlassView key={tintColor} style={{ borderRadius: 100 }} tintColor={tintColor}>
                        <Ripple
                            onPress={!isValid && prediction ? applyPrediction : handleSubmit}
                            style={styles.save}
                            disabled={!isValid && !prediction && !canPredict}
                        >
                            {loading && <ActivityIndicator size={14} color={Colors.foreground} />}
                            <Text
                                variant="caption"
                                style={{
                                    color:
                                        isValid || (!isValid && prediction)
                                            ? Colors.foreground
                                            : lowOpacity(Colors.secondary_light_1, 0.5),
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
                    </GlassView>
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    dropdown: {
        position: "absolute",
        bottom: "100%",
        left: 0,
        right: 0,
        marginBottom: 6,
        borderRadius: 20,
        borderWidth: 1,
        zIndex: 10,
    },
    input: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 18,
        flex: 1,
        width: Layout.screen.width - 30,
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
    item: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        height: ITEM_HEIGHT,
        gap: 10,
    },
    itemBorder: {
        borderBottomWidth: 0.5,
        borderBottomColor: Color(Colors.primary).lighten(1.2).hex(),
    },
    iconWrap: {
        width: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    itemDescription: {
        flex: 1,
        color: Colors.foreground,
        fontSize: 14,
    },
    itemAmount: {
        color: "rgba(255,255,255,0.65)",
        fontSize: 13,
        fontWeight: "500",
        flexShrink: 0,
    },
})
