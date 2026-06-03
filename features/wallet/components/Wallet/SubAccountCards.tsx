import { formatAmount } from "@/utils/functions/formatCurrency"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import Color from "color"
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import { useSubAccounts, useDeleteSubAccount } from "../../hooks/useSubAccounts"
import { useWalletContext } from "../WalletContext"
import { useNavigation } from "@react-navigation/native"
import Layout from "@/constants/Layout"
import { useMemo } from "react"
import Animated, { FadeIn } from "react-native-reanimated"

interface SubAccount {
    id: string
    name: string
    description?: string | null
    color?: string | null
    icon?: string | null
    balance: number
    isDefault: boolean
    income?: number | null
    expense?: number | null
}

const CARD_W = Layout.screen.width * 0.8
const CARD_H = CARD_W * 0.6

export default function SubAccountCards() {
    const { data } = useSubAccounts()
    const accounts = [...(data?.wallet?.subAccounts ?? [])].sort((a, b) => (a.isDefault ? -1 : b.isDefault ? 1 : 0))
    const { filters } = useWalletContext()
    const navigation = useNavigation<any>()
    const [deleteSubAccount] = useDeleteSubAccount()

    const onPress = (account: SubAccount) => {
        navigation.navigate("ExpensesList", { filters: { accountId: account.id } })
    }

    const sortedAccounts = useMemo(() => {
        return [...accounts].sort((a, b) => {
            if (a.isDefault) return -1

            return a.balance > b.balance ? -1 : 1
        })
    }, [accounts])

    return (
        <Animated.View entering={FadeIn}>
            <FlatList
                initialNumToRender={2}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
                data={sortedAccounts}
                keyExtractor={(a) => a.id}
                ListFooterComponent={<AddCard onPress={() => navigation.navigate("CreateSubAccount")} />}
                renderItem={({ item: a }) => (
                    <AccountCard
                        key={a.id}
                        account={a}
                        active={filters?.accountId === a.id || (!filters.accountId && a.isDefault)}
                        onPress={() => onPress(a)}
                        onEdit={() => navigation.navigate("CreateSubAccount", { editSubAccount: a })}
                        onDelete={() => deleteSubAccount({ variables: { id: a.id } })}
                        onTransfer={() => navigation.navigate("TransferSubAccount", { from: a.id })}
                    />
                )}
            />
        </Animated.View>
    )
}

function AccountCard({
    account,
    active = false,
    onPress,
    onEdit,
    onDelete,
    onTransfer,
}: {
    account: SubAccount
    active?: boolean
    onPress?: () => void
    onEdit?: () => void
    onDelete?: () => void
    onTransfer?: () => void
}) {
    const accent = account.color ?? Colors.secondary
    const base = Color(accent).darken(0.45).string()
    const mid = Color(accent).darken(0.28).string()
    const dimAccent = Color(accent).alpha(0.32).string()
    const dimAccent2 = Color(accent).alpha(0.16).string()

    const oposite = (Color(accent).isLight() ? Color(accent).darken(0.8) : Color(accent).lighten(0.8)).string()

    const activeMid = active ? mid : Color(mid).darken(0.3).string()
    const activeBase = active ? base : Color(base).darken(0.3).string()

    return (
        <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
            <LinearGradient
                colors={[activeMid, activeBase, Color(activeBase).darken(0.15).string()]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* texture circles */}
                <View style={[styles.texCircle1, { backgroundColor: dimAccent }]} />
                <View style={[styles.texCircle2, { backgroundColor: dimAccent2 }]} />
                <View style={[styles.texCircle3, { backgroundColor: dimAccent }]} />

                {/* stripe lines */}
                <View style={[styles.stripe, { backgroundColor: Color(accent).alpha(0.12).string(), top: 38 }]} />
                <View style={[styles.stripe, { backgroundColor: Color(accent).alpha(0.07).string(), top: 50 }]} />

                {/* dark top-to-bottom overlay */}
                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.5)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                    pointerEvents="none"
                />

                {/* top row */}
                <View style={styles.topRow}>
                    <View style={[styles.iconWrap, { backgroundColor: Color(accent).alpha(0.22).string() }]}>
                        <Feather name="credit-card" size={20} color={accent} />
                    </View>
                    <View style={styles.topRight}>
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[
                                    styles.actionBtn,
                                    {
                                        backgroundColor: accent,
                                    },
                                ]}
                                onPress={onTransfer}
                                hitSlop={6}
                            >
                                <Feather name="repeat" size={13} color={oposite} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.actionBtn,
                                    {
                                        backgroundColor: accent,
                                    },
                                ]}
                                onPress={onEdit}
                                hitSlop={6}
                            >
                                <Feather name="edit-2" size={13} color={oposite} />
                            </TouchableOpacity>
                            {/* <TouchableOpacity style={styles.actionBtn} onPress={onDelete} hitSlop={6}>
                                <MaterialCommunityIcons name="trash-can-outline" size={13} color={Colors.primary} />
                            </TouchableOpacity> */}
                        </View>
                    </View>
                </View>

                {/* name + balance */}
                <View>
                    <Text size={15} weight="700" color="rgba(255,255,255,0.9)" letterSpacing={0.3} style={{ marginTop: 2 }} numberOfLines={1}>
                        {account.name}
                    </Text>
                    <View style={styles.balanceBlock}>
                        <Text size={24} weight="800" color="#fff" letterSpacing={0.5} mono>{formatAmount(account.balance)}</Text>
                        <Text size={13} weight="500" color={Color(accent).alpha(0.7).string()} style={{ marginBottom: 3 }}>zł</Text>
                    </View>
                </View>

                {/* income / expense row */}
                <View style={[styles.separator, { backgroundColor: Color(accent).alpha(0.18).string() }]} />
                <View style={styles.bottomRow}>
                    <View style={styles.statBlock}>
                        <Text size={9} weight="500" uppercase letterSpacing={0.4} color={Color(accent).alpha(0.85).string()}>
                            Monthly Income
                        </Text>
                        <View style={styles.statRow}>
                            <Text size={13} weight="700" color="#fff" mono>{account.income ? formatAmount(account.income) : "0.00"}</Text>
                            <Feather name="trending-up" size={13} color="#4ade80" />
                        </View>
                    </View>
                    <View style={[styles.statBlock, { alignItems: "flex-end" }]}>
                        <Text size={9} weight="500" uppercase letterSpacing={0.4} color="#f87171">Monthly Expense</Text>
                        <View style={styles.statRow}>
                            <Text size={13} weight="700" color="#fff" mono>
                                {account.expense ? formatAmount(account.expense) : "0.00"}
                            </Text>
                            <Feather name="trending-down" size={13} color="#f87171" />
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    )
}

function AddCard({ onPress }: { onPress: () => void }) {
    return (
        <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.card, styles.addCard]}>
            <Feather name="plus" size={30} color={Colors.foreground_secondary} />
            <Text size={12} color={Colors.foreground_secondary} style={{ marginTop: 8 }}>New account</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    scroll: {
        gap: 15,
    },

    card: {
        width: CARD_W,
        height: CARD_H,
        borderRadius: 20,
        padding: 16,
        justifyContent: "space-between",
        overflow: "hidden",
    },
    texCircle1: {
        position: "absolute",
        width: 180,
        height: 180,
        borderRadius: 90,
        right: -55,
        top: -60,
    },
    texCircle2: {
        position: "absolute",
        width: 120,
        height: 120,
        borderRadius: 60,
        right: -20,
        bottom: -40,
    },
    texCircle3: {
        position: "absolute",
        width: 70,
        height: 70,
        borderRadius: 35,
        left: -20,
        bottom: -20,
    },
    stripe: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 1,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 11,
        alignItems: "center",
        justifyContent: "center",
    },
    topRight: {
        alignItems: "flex-end",
        position: "absolute",
        right: 0,
        top: 0,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        marginBottom: 8,
    },
    bottomRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
    },
    balanceBlock: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 3,
        marginTop: 2,
    },
    statBlock: {
        gap: 1,
    },
    statRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    actions: {
        flexDirection: "row",
        gap: 5,
    },
    actionBtn: {
        width: 24,
        height: 24,
        borderRadius: 7,
        backgroundColor: "rgba(255,255,255,0.92)",
        alignItems: "center",
        justifyContent: "center",
    },
    addCard: {
        backgroundColor: Colors.primary_lighter,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: Color(Colors.primary_lighter).lighten(0.3).string(),
        borderStyle: "dashed",
    },
})
