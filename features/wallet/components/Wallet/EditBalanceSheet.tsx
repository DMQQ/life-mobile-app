import BottomSheet from "@/components/ui/BottomSheet/BottomSheet"
import Button from "@/components/ui/Button/Button"
import Text from "@/components/ui/Text/Text"
import Input from "@/components/ui/TextInput/TextInput"
import Colors from "@/constants/Colors"
import { useState } from "react"
import { ActivityIndicator, Keyboard, View } from "react-native"
import useEditWallet from "../../hooks/useEditWallet"
import { useWalletContext } from "../WalletContext"

export default function EditBalanceSheet() {
    const [value, setValue] = useState<string>("")

    const {
        refs: { editBalanceRef },
    } = useWalletContext()

    const { editBalance, loading } = useEditWallet(() => {
        editBalanceRef.current?.close()
    })

    const onPress = async () => {
        if (!value || !Number.isSafeInteger(Number(value))) return

        await editBalance({
            variables: {
                balance: Number(value),
            },
        })
    }

    return (
        <BottomSheet
            snapPoints={["40%"]}
            ref={editBalanceRef}
            onChange={(index) => {
                if (index === -1) {
                    setValue("")
                    Keyboard.dismiss()
                }
            }}
        >
            <View
                style={{
                    flex: 1,
                    paddingHorizontal: 15,
                    marginTop: 10,
                    minHeight: 170,
                }}
            >
                <Input
                    placeholder="Enter new balance"
                    useBottomSheetInput
                    value={value}
                    onChangeText={setValue}
                    keyboardAppearance="dark"
                    keyboardType="number-pad"
                />
                <Text variant="body" style={{ color: "gray" }}>
                    This will set your balance to the value you enter. It will not affect your expenses or income.
                </Text>

                <Text variant="body" style={{ color: Colors.error, marginTop: 10 }}>
                    This action cannot be undone.
                </Text>

                <Button
                    icon={
                        loading && (
                            <ActivityIndicator
                                style={{ marginHorizontal: 10 }}
                                size="small"
                                color={Colors.foreground}
                            />
                        )
                    }
                    fontStyle={{ fontSize: 16 }}
                    style={{ flexDirection: "row-reverse", marginTop: 15 }}
                    onPress={onPress}
                >
                    Save balance
                </Button>
            </View>
        </BottomSheet>
    )
}
