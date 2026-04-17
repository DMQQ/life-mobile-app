import Colors from "@/constants/Colors"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import Color from "color"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import ContextMenuView from "react-native-context-menu-view"
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

const CARD_W = 165
const CARD_H = 110

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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {accounts.map((a) => (
                <ContextMenuView
                    key={a.id}
                    actions={[
                        { title: "Edit", systemIcon: "pencil" },
                        { title: "Remove", systemIcon: "trash", destructive: true },
                    ]}
                    onPress={(e) => {
                        if (e.nativeEvent.name === "Edit") {
                            navigation.navigate("CreateSubAccount", { editSubAccount: a })
                        } else if (e.nativeEvent.name === "Remove") {
                            deleteSubAccount({ variables: { id: a.id } })
                        }
                    }}
                    previewBackgroundColor={a.color}
                >
                    <AccountCard account={a} active={filters?.accountId === a.id} onPress={() => onPress(a)} />
                </ContextMenuView>
            ))}
            <AddCard onPress={() => navigation.navigate("CreateSubAccount")} />
        </ScrollView>
    )
}

function AccountCard({
    account,
    active = false,
    onPress,
}: {
    account: SubAccount
    active?: boolean
    onPress?: () => void
}) {
    const bg = Color(account.color).darken(0.4).string()
    const accent = account.color

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[styles.card, { backgroundColor: bg, opacity: active ? 1 : 0.6 }]}
        >
            <View style={styles.cardTop}>
                <View style={[styles.iconWrap, { backgroundColor: Color(accent).alpha(0.25).string() }]}>
                    <MaterialCommunityIcons name={account.icon as any} size={18} color={accent} />
                </View>
                <Text style={styles.cardLabel} numberOfLines={1}>
                    {account.name}
                </Text>
            </View>
            {account.description ? (
                <Text style={styles.cardDesc} numberOfLines={1}>
                    {account.description}
                </Text>
            ) : null}
            <View style={styles.cardBottom}>
                <Text style={[styles.cardBalance, { color: accent }]}>{account.balance.toFixed(2)}</Text>
                <Text style={[styles.cardCurrency, { color: Color(accent).alpha(0.7).string() }]}>zł</Text>
            </View>
            <CardChip color={Color(accent).alpha(0.12).string()} />
        </TouchableOpacity>
    )
}

function AddCard({ onPress }: { onPress: () => void }) {
    return (
        <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.card, styles.addCard]}>
            <MaterialCommunityIcons name="plus" size={28} color={Colors.foreground_secondary} />
            <Text style={styles.addLabel}>New account</Text>
        </TouchableOpacity>
    )
}

function CardChip({ color }: { color: string }) {
    return <View style={[styles.chip, { backgroundColor: color }]} />
}

const styles = StyleSheet.create({
    scroll: {
        gap: 12,
        marginBottom: 25,
    },
    card: {
        width: CARD_W,
        height: CARD_H,
        borderRadius: 18,
        padding: 14,
        justifyContent: "space-between",
        overflow: "hidden",
    },
    cardTop: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    iconWrap: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    cardLabel: {
        color: "rgba(255,255,255,0.75)",
        fontSize: 13,
        fontWeight: "600",
        flex: 1,
    },
    cardBottom: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 4,
    },
    cardBalance: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    cardCurrency: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 13,
        fontWeight: "500",
        marginBottom: 2,
    },
    cardDesc: {
        color: "rgba(255,255,255,0.4)",
        fontSize: 11,
    },
    chip: {
        position: "absolute",
        width: 60,
        height: 60,
        borderRadius: 30,
        right: -15,
        top: -15,
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
        marginTop: 6,
    },
})
