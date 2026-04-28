import Animated, { FadeIn, LinearTransition } from "react-native-reanimated"
import { CategoryIcon, CategoryUtils, Icons } from "../Expense/ExpenseIcon"
import { useEffect, useRef, useState } from "react"
import Input from "@/components/ui/TextInput/TextInput"
import Colors from "@/constants/Colors"
import lowOpacity from "@/utils/functions/lowOpacity"
import { Text, View, StyleSheet, FlatList } from "react-native"
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
    const dismiss = props?.dismiss ?? (() => {
        ctx?.methods.setView("main")
        ctx?.methods.setCategory("none")
    })
    const onPress = props?.onPress ?? ((item: string) => {
        ctx?.methods.setIsSubscription(item === "subscription")
        ctx?.methods.setType("expense")
        ctx?.methods.setCategory(item as keyof typeof Icons)
        ctx?.methods.setView("main")
    })

    const data = Object.entries(Icons)
    const [query, setQuery] = useState("")

    const filteredData = data.filter(
        (item) =>
            !["edit", "none", "income", "refunded", "bell"].includes(item[0]) &&
            item[0].toLowerCase().includes(query.toLowerCase()),
    )

    const listRef = useRef<FlatList>(null)

    useEffect(() => {
        if (listRef.current && query.length > 0) {
            listRef.current.scrollToOffset({ animated: true, offset: 0 })
        } else if (current) {
            const currentIndex = filteredData.find((item) => item[0] === current)
            listRef.current?.scrollToItem({ item: currentIndex, animated: false })
        }
    }, [query, current])

    return (
        <Animated.View entering={FadeIn} style={styles.selectorContainer}>
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

            <Animated.FlatList
                initialNumToRender={10}
                getItemLayout={(_, index) => ({ length: 60, offset: 70 * index, index })}
                ref={listRef}
                layout={LinearTransition}
                style={styles.optionsGrid}
                data={filteredData}
                keyExtractor={(item) => item[0]}
                keyboardDismissMode={"on-drag"}
                renderItem={({ item }) => (
                    <Animated.View style={{ marginBottom: 15, height: 60 }}>
                        <Ripple
                            onPress={() => {
                                Feedback.trigger("impactLight")
                                onPress(item[0])
                            }}
                            style={[
                                styles.optionButton,
                                {
                                    backgroundColor:
                                        item[0] === current
                                            ? lowOpacity(item[1].backgroundColor, 0.25)
                                            : Colors.primary_lighter,
                                },
                            ]}
                        >
                            <CategoryIcon category={item[0] as keyof typeof Icons} type="expense" />

                            {item[0]?.includes(":") ? (
                                <View style={{ flex: 1, justifyContent: "center", gap: 5 }}>
                                    <Text
                                        style={{
                                            color: lowOpacity(Colors.foreground, 0.75),
                                            textTransform: "capitalize",
                                            fontSize: 10,
                                        }}
                                    >
                                        {CategoryUtils.getCategoryParent(item[0])}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.optionLabel,
                                            {
                                                color:
                                                    item[0] === current
                                                        ? Color(item[1].backgroundColor).lighten(0.5).hex()
                                                        : "rgba(255,255,255,0.9)",
                                            },
                                        ]}
                                    >
                                        {CategoryUtils.getCategoryName(item[0])}
                                    </Text>
                                </View>
                            ) : (
                                <Text
                                    style={[
                                        styles.optionLabel,
                                        {
                                            color:
                                                item[0] === current
                                                    ? Color(item[1].backgroundColor).lighten(0.5).hex()
                                                    : "rgba(255,255,255,0.9)",
                                        },
                                    ]}
                                >
                                    {CategoryUtils.getCategoryName(item[0])}
                                </Text>
                            )}

                            {item[0] === current && (
                                <View style={[styles.selectedIndicator, { backgroundColor: item[1].backgroundColor }]}>
                                    <Text style={styles.indicatorText}>✓</Text>
                                </View>
                            )}
                        </Ripple>
                    </Animated.View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No categories found</Text>
                    </View>
                }
            />
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    selectorContainer: {
        flex: 1,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.foreground,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: "rgba(255,255,255,0.7)",
    },
    searchContainer: {
        backgroundColor: Colors.primary_lighter,
        borderRadius: 10,
        padding: 5,
    },
    searchInput: {
        padding: 15,
        fontSize: 16,
    },
    closeButton: {
        padding: 0,
    },
    optionsGrid: {
        flex: 1,
    },
    optionButton: {
        flexDirection: "row",
        padding: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    optionLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    selectedIndicator: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    indicatorText: {
        color: Colors.foreground,
        fontSize: 16,
        fontWeight: "bold",
    },
    emptyContainer: {
        padding: 20,
        alignItems: "center",
    },
    emptyText: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 16,
    },
})

export default CategorySelector
