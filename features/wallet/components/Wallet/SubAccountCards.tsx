import Colors from "@/constants/Colors"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import Color from "color"
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useSubAccounts, useDeleteSubAccount } from "../../hooks/useSubAccounts"
import { useWalletContext } from "../WalletContext"
import { useNavigation } from "@react-navigation/native"

interface SubAccount {
    id: string
    name: string
    description?: string | null
    color: string
    icon: string
    balance: number
    isDefault: boolean
}

const CARD_W = 260
const CARD_H = 155

export default function SubAccountCards() {
    const { data } = useSubAccounts()
    const accounts = [...(data?.wallet?.subAccounts ?? [])].sort((a, b) => (a.isDefault ? -1 : b.isDefault ? 1 : 0))
    const { filters, dispatch } = useWalletContext()
    const navigation = useNavigation<any>()
    const [deleteSubAccount] = useDeleteSubAccount()

    const onPress = (account: SubAccount) => {
        if (filters?.accountId === account.id) {
            dispatch({ type: "SET_ACCOUNT_ID", payload: undefined })
        } else {
            dispatch({ type: "SET_ACCOUNT_ID", payload: account.id })
        }
    }

    return (
        <FlatList
            initialNumToRender={2}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
            data={accounts}
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
    const base = Color(account.color).darken(0.45).string()
    const mid = Color(account.color).darken(0.28).string()
    const accent = account.color
    const dimAccent = Color(accent).alpha(0.18).string()
    const dimAccent2 = Color(accent).alpha(0.08).string()

    const oposite = (Color(accent).isLight() ? Color(accent).darken(0.8) : Color(accent).lighten(0.8)).string()

    return (
        <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ opacity: active ? 1 : 0.55 }}>
            <LinearGradient
                colors={[mid, base, Color(base).darken(0.15).string()]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* texture circles */}
                <View style={[styles.texCircle1, { backgroundColor: dimAccent }]} />
                <View style={[styles.texCircle2, { backgroundColor: dimAccent2 }]} />
                <View style={[styles.texCircle3, { backgroundColor: dimAccent }]} />

                {/* stripe lines */}
                <View style={[styles.stripe, { backgroundColor: Color(accent).alpha(0.06).string(), top: 38 }]} />
                <View style={[styles.stripe, { backgroundColor: Color(accent).alpha(0.04).string(), top: 50 }]} />

                {/* top row */}
                <View style={styles.topRow}>
                    <View style={[styles.iconWrap, { backgroundColor: Color(accent).alpha(0.22).string() }]}>
                        <MaterialCommunityIcons name={account.icon as any} size={20} color={accent} />
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
                                <MaterialCommunityIcons name="swap-horizontal" size={13} color={oposite} />
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
                                <MaterialCommunityIcons name="pencil-outline" size={13} color={oposite} />
                            </TouchableOpacity>
                            {/* <TouchableOpacity style={styles.actionBtn} onPress={onDelete} hitSlop={6}>
                                <MaterialCommunityIcons name="trash-can-outline" size={13} color={Colors.primary} />
                            </TouchableOpacity> */}
                        </View>
                    </View>
                </View>

                {/* name */}
                <Text style={styles.cardName} numberOfLines={1}>
                    {account.name}
                </Text>
                {account.description ? (
                    <Text style={styles.cardDesc} numberOfLines={1}>
                        {account.description}
                    </Text>
                ) : null}

                {/* chip + balance row */}
                <View style={styles.bottomRow}>
                    <View style={styles.chipGroup}>
                        <View style={[styles.chip1, { borderColor: Color(accent).alpha(0.5).string() }]} />
                        <View style={[styles.chip2, { backgroundColor: Color(accent).alpha(0.25).string() }]} />
                    </View>
                    <View style={styles.balanceBlock}>
                        <Text style={[styles.balanceAmount, { color: "#fff" }]}>{account.balance.toFixed(2)}</Text>
                        <Text style={[styles.balanceCurrency, { color: Color(accent).alpha(0.7).string() }]}>zł</Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    )
}

function AddCard({ onPress }: { onPress: () => void }) {
    return (
        <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.card, styles.addCard]}>
            <MaterialCommunityIcons name="plus" size={30} color={Colors.foreground_secondary} />
            <Text style={styles.addLabel}>New account</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    scroll: {
        gap: 14,
        marginBottom: 25,
        paddingHorizontal: 2,
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
    defaultBadge: {
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    defaultText: {
        fontSize: 10,
        fontWeight: "600",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    cardName: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 0.3,
        marginTop: 2,
    },
    cardDesc: {
        color: "rgba(255,255,255,0.38)",
        fontSize: 11,
        marginTop: 1,
    },
    bottomRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
    },
    chipGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    chip1: {
        width: 28,
        height: 20,
        borderRadius: 5,
        borderWidth: 1.5,
    },
    chip2: {
        width: 18,
        height: 20,
        borderRadius: 5,
    },
    balanceBlock: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 3,
    },
    balanceAmount: {
        fontSize: 22,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    balanceCurrency: {
        fontSize: 13,
        fontWeight: "500",
        marginBottom: 2,
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
    addLabel: {
        color: Colors.foreground_secondary,
        fontSize: 12,
        marginTop: 8,
    },
})
