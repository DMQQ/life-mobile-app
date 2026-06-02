import { FONTS } from "@/constants/Fonts"
import { Button } from "@/components"
import IconButton from "@/components/ui/IconButton/IconButton"
import Text from "@/components/ui/Text/Text"
import Input from "@/components/ui/TextInput/TextInput"
import Colors from "@/constants/Colors"
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons"
import Color from "color"
import { useEffect, useState } from "react"
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import { SafeAreaView } from "react-native-safe-area-context"
import { useSubAccounts, useTransferBetweenSubAccounts } from "../hooks/useSubAccounts"
import { WalletScreens } from "../Main"
import GlassView from "@/components/ui/GlassView"
import GroupSelector from "@/components/ui/GroupSelector"
import IconSaveButton from "@/components/ui/Button/IconSaveButton"

export default function TransferSubAccount({ navigation, route }: WalletScreens<"TransferSubAccount">) {
    const { data } = useSubAccounts()
    const accounts = data?.wallet?.subAccounts ?? []

    const [fromAccount, setFromAccount] = useState<(typeof accounts)[0] | null>(null)
    const [toAccount, setToAccount] = useState<(typeof accounts)[0] | null>(null)

    useEffect(() => {
        if (accounts.length === 0 || fromAccount !== null) return
        const match = route.params?.fromId ? accounts.find((a) => a.id === route.params?.fromId) : null
        setFromAccount(match ?? accounts[0])
    }, [accounts])
    const [amount, setAmount] = useState("")
    const [step, setStep] = useState<"from" | "to" | "amount">("from")

    const [transfer, { loading, error }] = useTransferBetweenSubAccounts(() => {
        Feedback.trigger("notificationSuccess")
        navigation.goBack()
    })

    console.log("Transfer error:", JSON.stringify(error, null, 2))

    const swap = () => {
        const tmp = fromAccount
        setFromAccount(toAccount)
        setToAccount(tmp)
    }

    const canSubmit =
        fromAccount &&
        toAccount &&
        fromAccount.id !== toAccount.id &&
        amount !== "" &&
        !isNaN(Number(amount)) &&
        Number(amount) > 0 &&
        Number(amount) <= (fromAccount?.balance ?? 0)

    const handleSubmit = () => {
        if (!canSubmit) return
        transfer({
            variables: {
                input: {
                    fromId: fromAccount!.id,
                    toId: toAccount!.id,
                    amount: parseFloat(amount),
                },
            },
        })
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <GlassView style={{ borderRadius: 100, padding: 7.5 }}>
                    <IconButton
                        icon={<AntDesign name="close" size={20} color={Colors.foreground} />}
                        onPress={() => navigation.goBack()}
                    />
                </GlassView>
                <Text variant="title" style={styles.title}>
                    Transfer
                </Text>
                <View style={{ width: 44 }} />
            </View>

            <IconSaveButton disabled={!canSubmit || loading} onPress={handleSubmit} loading={loading} />

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 32 }}
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.transferRow}>
                    <AccountSlot
                        label="From"
                        account={fromAccount}
                        active={step === "from"}
                        onPress={() => setStep("from")}
                    />

                    <TouchableOpacity style={styles.swapBtn} onPress={swap} activeOpacity={0.7}>
                        <AntDesign name="swap" size={20} color={Colors.secondary} />
                    </TouchableOpacity>

                    <AccountSlot label="To" account={toAccount} active={step === "to"} onPress={() => setStep("to")} />
                </View>

                {(step === "from" || step === "to") && (
                    <View style={styles.pickerSection}>
                        <Text style={styles.pickerLabel}>
                            Select {step === "from" ? "source" : "destination"} account
                        </Text>
                        <View style={styles.pickerList}>
                            {accounts.map((acc) => {
                                const selected = step === "from" ? fromAccount?.id === acc.id : toAccount?.id === acc.id
                                const disabled = step === "from" ? toAccount?.id === acc.id : fromAccount?.id === acc.id
                                return (
                                    <TouchableOpacity
                                        key={acc.id}
                                        activeOpacity={0.75}
                                        disabled={disabled}
                                        onPress={() => {
                                            if (step === "from") {
                                                setFromAccount(acc)
                                            } else {
                                                setToAccount(acc)
                                            }
                                            setStep("amount")
                                        }}
                                        style={[
                                            styles.accountRow,
                                            selected && {
                                                borderColor: acc.color ?? Colors.secondary,
                                                backgroundColor: Color(acc.color ?? Colors.secondary).alpha(0.1).string(),
                                            },
                                            disabled && styles.accountRowDisabled,
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.accountIcon,
                                                { backgroundColor: Color(acc.color ?? Colors.secondary).alpha(0.2).string() },
                                            ]}
                                        >
                                            <MaterialCommunityIcons
                                                name={acc.icon as any}
                                                size={20}
                                                color={acc.color ?? Colors.foreground}
                                            />
                                        </View>
                                        <View style={styles.accountInfo}>
                                            <Text style={styles.accountName}>{acc.name}</Text>
                                            <Text style={styles.accountBalance}>${acc.balance.toFixed(2)}</Text>
                                        </View>
                                        {selected && <AntDesign name="check" size={16} color={acc.color ?? Colors.foreground} />}
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>
                )}

                {step === "amount" && (
                    <View style={styles.amountSection}>
                        <Input
                            value={amount}
                            onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ""))}
                            placeholder="Amount"
                            keyboardType="numeric"
                            autoFocus
                            error={amount !== "" && fromAccount != null && Number(amount) > fromAccount.balance}
                            helperText={
                                amount !== "" && fromAccount != null && Number(amount) > fromAccount.balance
                                    ? `Insufficient balance (${fromAccount.balance.toFixed(2)})`
                                    : undefined
                            }
                            left={
                                <View style={styles.inputIcon}>
                                    <AntDesign name="swap" size={18} color={Colors.secondary} />
                                </View>
                            }
                        />
                        {fromAccount && (
                            <Text style={styles.balanceHint}>Available: ${fromAccount.balance.toFixed(2)}</Text>
                        )}

                        <View>
                            <GroupSelector
                                options={[{ label: "500", value: "500" }, { label: "50%", value: "50%" }, { label: "100%", value: "100%" }]}
                                value={amount}
                                onChange={(value) => {
                                    const numericValue = value.endsWith("%")
                                        ? (((fromAccount?.balance ?? 0) * parseFloat(value)) / 100).toFixed(2)
                                        : value
                                    setAmount(numericValue)
                                }}
                            />
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

function AccountSlot({
    label,
    account,
    active,
    onPress,
}: {
    label: string
    account: { name: string; color?: string | null; icon?: string | null; balance: number } | null
    active: boolean
    onPress: () => void
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[
                styles.slot,
                active && styles.slotActive,
                account && { borderColor: Color(account.color ?? Colors.secondary).alpha(0.5).string() },
            ]}
        >
            {account ? (
                <>
                    <View style={[styles.slotIcon, { backgroundColor: Color(account.color ?? Colors.secondary).alpha(0.2).string() }]}>
                        <MaterialCommunityIcons name={(account.icon ?? "help-circle") as any} size={22} color={account.color ?? Colors.foreground} />
                    </View>
                    <Text style={styles.slotName} numberOfLines={1}>
                        {account.name}
                    </Text>
                    <Text style={[styles.slotBalance, { color: account.color ?? Colors.foreground }]}>${account.balance.toFixed(2)}</Text>
                </>
            ) : (
                <>
                    <View style={styles.slotIconEmpty}>
                        <AntDesign name="plus" size={18} color={Colors.foreground_secondary} />
                    </View>
                    <Text style={styles.slotLabel}>{label}</Text>
                </>
            )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15,
    },
    title: {
        fontSize: 18,
        fontFamily: FONTS.semibold,
    },
    content: {
        flex: 1,
        padding: 15,
    },
    transferRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 24,
    },
    swapBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary_light,
        alignItems: "center",
        justifyContent: "center",
    },
    slot: {
        flex: 1,
        backgroundColor: Colors.primary_light,
        borderRadius: 16,
        padding: 14,
        alignItems: "center",
        gap: 6,
        borderWidth: 1.5,
        borderColor: "transparent",
    },
    slotActive: {
        borderColor: Colors.secondary,
    },
    slotIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    slotIconEmpty: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary_lighter,
        alignItems: "center",
        justifyContent: "center",
    },
    slotName: {
        fontSize: 13,
        fontFamily: FONTS.semibold,
        textAlign: "center",
    },
    slotBalance: {
        fontSize: 12,
        fontFamily: FONTS.medium,
    },
    slotLabel: {
        fontSize: 13,
        color: Colors.foreground_secondary,
    },
    pickerSection: {
        marginBottom: 16,
    },
    pickerLabel: {
        color: Colors.foreground_secondary,
        fontSize: 13,
        marginBottom: 10,
    },
    pickerList: {
        gap: 8,
    },
    accountRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: Colors.primary_light,
        borderRadius: 14,
        padding: 12,
        borderWidth: 1.5,
        borderColor: "transparent",
    },
    accountRowDisabled: {
        opacity: 0.35,
    },
    accountIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    accountInfo: {
        flex: 1,
    },
    accountName: {
        fontSize: 14,
        fontFamily: FONTS.semibold,
    },
    accountBalance: {
        fontSize: 12,
        color: Colors.foreground_secondary,
        marginTop: 2,
    },
    amountSection: {
        gap: 6,
    },
    inputIcon: {
        paddingLeft: 8,
    },
    balanceHint: {
        fontSize: 12,
        color: Colors.foreground_secondary,
        paddingLeft: 4,
    },
    footer: {
        padding: 15,
        paddingBottom: 15,
    },
    btn: {
        width: "100%",
        borderRadius: 100,
    },
})
