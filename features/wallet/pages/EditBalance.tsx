import Button2 from "@/components/ui/Button/Button2"
import IconButton from "@/components/ui/IconButton/IconButton"
import Text from "@/components/ui/Text/Text"
import Input from "@/components/ui/TextInput/TextInput"
import Colors from "@/constants/Colors"
import { AntDesign, Ionicons } from "@expo/vector-icons"
import { useMemo, useState } from "react"
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from "react-native"
import useEditWallet from "../hooks/useEditWallet"
import { WalletScreens } from "../Main"

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {},
    inputContainer: {
        marginBottom: 15,
        position: "relative",
    },
    validationIcon: {
        position: "absolute",
        right: 16,
        top: "50%",
        transform: [{ translateY: -12 }],
        zIndex: 1,
    },
    warningBanner: {
        backgroundColor: Colors.error + "15",
        borderRadius: 15,
        padding: 15,
    },
    descriptionSection: {},
    buttonContainer: {
        marginTop: 15,
    },
})

export default function EditBalance({ navigation }: WalletScreens<"EditBalance">) {
    const [value, setValue] = useState<string>("")

    const { editBalance, loading } = useEditWallet(() => {
        navigation.goBack()
    })

    const validation = useMemo(() => {
        if (!value.trim()) {
            return { isValid: false, icon: null, message: "" }
        }

        const numValue = Number(value)

        if (isNaN(numValue)) {
            return {
                isValid: false,
                icon: <AntDesign name="closecircle" size={20} color={Colors.error} />,
                message: "Please enter a valid number",
            }
        }

        if (numValue < 0) {
            return {
                isValid: false,
                icon: <AntDesign name="closecircle" size={20} color={Colors.error} />,
                message: "Balance cannot be negative",
            }
        }

        if (!Number.isSafeInteger(numValue)) {
            return {
                isValid: false,
                icon: <AntDesign name="closecircle" size={20} color={Colors.error} />,
                message: "Please enter a whole number",
            }
        }

        return {
            isValid: true,
            icon: <AntDesign name="checkcircle" size={20} color="#4CAF50" />,
            message: "",
        }
    }, [value])

    const onPress = async () => {
        if (!validation.isValid) return

        await editBalance({
            variables: {
                balance: Number(value),
            },
        })
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <IconButton
                    icon={<AntDesign name="close" size={24} color={Colors.foreground} />}
                    onPress={() => navigation.goBack()}
                />
            </View>

            <View style={styles.content}>
                <Text variant="body" style={{ color: Colors.foreground_secondary, fontSize: 15, marginBottom: 10 }}>
                    Enter your current balance amount
                </Text>

                <View style={styles.inputContainer}>
                    <Input
                        placeholder="Enter new balance"
                        value={value}
                        onChangeText={setValue}
                        keyboardAppearance="dark"
                        keyboardType="number-pad"
                        style={{
                            paddingRight: validation.icon ? 50 : 16,
                            borderColor: value.trim() && !validation.isValid ? Colors.error : undefined,
                        }}
                    />
                    {validation.icon && <View style={styles.validationIcon}>{validation.icon}</View>}
                </View>

                {validation.message && (
                    <Text variant="body" style={{ color: Colors.error, marginTop: -8, marginBottom: 16, fontSize: 14 }}>
                        {validation.message}
                    </Text>
                )}

                <View style={styles.warningBanner}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Ionicons name="warning" size={25} color={Colors.error} style={{ marginRight: 8 }} />
                        <Text variant="body" style={{ color: Colors.error, fontWeight: "600", fontSize: 18 }}>
                            Important Warning
                        </Text>
                    </View>
                    <Text variant="body" style={{ color: Colors.error, marginTop: 4, fontSize: 15 }}>
                        This action cannot be undone. Make sure the amount is correct. This will set your balance to the
                        value you enter. It will not affect your expenses or income.
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <Button2
                        icon={
                            loading && (
                                <ActivityIndicator
                                    style={{ marginHorizontal: 10 }}
                                    size="small"
                                    color={Colors.foreground}
                                />
                            )
                        }
                        variant="contained"
                        onPress={onPress}
                        disabled={!validation.isValid || loading}
                    >
                        Save Balance
                    </Button2>
                </View>
            </View>
        </SafeAreaView>
    )
}
