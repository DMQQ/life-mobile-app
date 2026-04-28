import { CategoryUtils, Icons } from "../Expense/ExpenseIcon"
import { cloneElement, useState } from "react"
import Input from "@/components/ui/TextInput/TextInput"
import Colors from "@/constants/Colors"
import lowOpacity from "@/utils/functions/lowOpacity"
import { Text, View, StyleSheet, ScrollView } from "react-native"
import Ripple from "react-native-material-ripple"
import IconButton from "@/components/ui/IconButton/IconButton"
import { AntDesign } from "@expo/vector-icons"
import Feedback from "react-native-haptic-feedback"
import Color from "color"
import { CreateExpenseContext } from "@/features/wallet/context/CreateExpenseContext"
import { useContext } from "react"

const CategorySelector = (props?: { current?: string; onPress?: (item: string) => void; dismiss?: VoidFunction }) => {
    const ctx = useContext(CreateExpenseContext)

    const current = props?.current ?? ctx?.state.category ?? "none"
    const dismiss =
        props?.dismiss ??
        (() => {
            ctx?.methods.setView("main")
            ctx?.methods.setCategory("none")
        })
    const onPress =
        props?.onPress ??
        ((item: string) => {
            ctx?.methods.setIsSubscription(item === "subscription")
            ctx?.methods.setType("expense")
            ctx?.methods.setCategory(item as keyof typeof Icons)
            ctx?.methods.setView("main")
        })

    const [query, setQuery] = useState("")

    const data = Object.entries(Icons).filter(([key]) => !["edit", "none", "income", "refunded", "bell"].includes(key))

    const filtered = query ? data.filter(([key]) => key.toLowerCase().includes(query.toLowerCase())) : data

    const [expandSearch, setExpandSearch] = useState(false)

    return (
        <View style={styles.selectorContainer}>
            <View>
                {expandSearch ? (
                    <Input
                        placeholder="Search for category"
                        placeholderTextColor={"rgba(255,255,255,0.5)"}
                        value={query}
                        onChangeText={setQuery}
                        containerStyle={styles.searchContainer}
                        style={styles.searchInput}
                        right={
                            <IconButton
                                onPress={dismiss}
                                icon={<AntDesign name="close" size={20} color={"rgba(255,255,255,0.7)"} />}
                                style={styles.closeButton}
                            />
                        }
                    />
                ) : (
                    <Ripple
                        onPress={() => {
                            Feedback.trigger("impactLight")
                            setExpandSearch(true)
                        }}
                    >
                        <Text style={styles.searchPlaceholder}>Search for category</Text>
                    </Ripple>
                )}
            </View>

            <ScrollView
                style={styles.list}
                showsVerticalScrollIndicator={false}
                bounces={false}
                keyboardDismissMode="on-drag"
            >
                {filtered.map(([key, meta]) => (
                    <Ripple
                        key={key}
                        onPress={() => {
                            Feedback.trigger("impactLight")
                            onPress(key)
                        }}
                        style={[
                            styles.option,
                            {
                                backgroundColor:
                                    key === current ? lowOpacity(meta.backgroundColor, 0.25) : Colors.primary_lighter,
                            },
                        ]}
                    >
                        {Icons[key as keyof typeof Icons]?.icon &&
                            cloneElement(
                                Icons[key as keyof typeof Icons].icon as React.ReactElement<{
                                    size: number
                                    color: string
                                }>,
                                { size: 18, color: meta.backgroundColor },
                            )}
                        <Text
                            style={[
                                styles.optionLabel,
                                {
                                    color:
                                        key === current
                                            ? Color(meta.backgroundColor).lighten(0.5).hex()
                                            : "rgba(255,255,255,0.85)",
                                },
                            ]}
                            numberOfLines={1}
                        >
                            {key.includes(":")
                                ? `${CategoryUtils.getCategoryParent(key)} - ${CategoryUtils.getCategoryName(key)}`
                                : CategoryUtils.getCategoryName(key)}
                        </Text>
                        {key === current && (
                            <View style={[styles.check, { backgroundColor: meta.backgroundColor }]}>
                                <Text style={styles.checkText}>✓</Text>
                            </View>
                        )}
                    </Ripple>
                ))}
                {filtered.length === 0 && (
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No categories found</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    selectorContainer: {
        flex: 1,
    },
    searchContainer: {
        backgroundColor: Colors.primary_lighter,
        borderRadius: 10,
        padding: 5,
        marginBottom: 10,
    },
    searchInput: {
        fontSize: 14,
    },
    closeButton: {
        padding: 0,
    },
    list: {
        flex: 1,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 10,
        gap: 12,
        marginBottom: 8,
    },
    optionLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: "500",
        textTransform: "capitalize",
    },
    check: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    checkText: {
        color: Colors.foreground,
        fontSize: 13,
        fontWeight: "bold",
    },
    empty: {
        padding: 20,
        alignItems: "center",
    },
    emptyText: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 14,
    },
    searchPlaceholder: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 14,
        padding: 10,
    },
})

export default CategorySelector
