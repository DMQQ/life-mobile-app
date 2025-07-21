import { Card } from "@/components"
import Button from "@/components/ui/Button/Button"
import Overlay from "@/components/ui/Overlay/Overlay"
import Text from "@/components/ui/Text/Text"
import Input from "@/components/ui/TextInput/TextInput"
import Colors from "@/constants/Colors"
import L from "@/constants/Layout"
import { Todos } from "@/types"
import { useState } from "react"
import { StyleSheet, View } from "react-native"
import useTransferTodos from "../hooks/mutation/useTransferTodos"

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    dialog: {
        padding: 24,
        borderRadius: 20,
        width: L.screen.width - 48,
        backgroundColor: Colors.primary_lighter,
    },
    title: {
        marginBottom: 16,
    },
    input: {
        width: "100%",
    },
    button: {
        marginTop: 16,
    },
})

interface TodoTransferDialogProps {
    visible: boolean
    onClose: () => void
    todos: Todos[]
}

export default function TodoTransferDialog({ visible, onClose, todos }: TodoTransferDialogProps) {
    const [dialogText, setDialogText] = useState("")
    const handleTransfer = useTransferTodos(todos, dialogText)

    const onTransfer = async () => {
        if (dialogText.trim()) {
            await handleTransfer()
            setDialogText("")
            onClose()
        }
    }

    return (
        <Overlay opacity={0.8} onClose={onClose} isVisible={visible}>
            <View style={styles.container}>
                <Card style={styles.dialog}>
                    <Text variant="subheading" style={styles.title}>
                        Transfer Todos
                    </Text>

                    <Text
                        variant="body"
                        color={Colors.text_light}
                        style={{ marginBottom: 16 }}
                    >
                        Enter the timeline ID where you want to transfer {todos.length} todo
                        {todos.length !== 1 ? "s" : ""}
                    </Text>

                    <Input
                        label="Timeline ID"
                        placeholder="xxxx-xxxxx-xxxxx"
                        placeholderTextColor="gray"
                        value={dialogText}
                        setValue={setDialogText}
                        style={styles.input}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
                        <Button style={{ flex: 1, padding: 10, borderWidth: 1 }} type="outlined" onPress={onClose}>
                            Cancel
                        </Button>
                        <Button
                            style={{ flex: 1, padding: 10 }}
                            type="contained"
                            onPress={onTransfer}
                            disabled={!dialogText.trim()}
                        >
                            Transfer
                        </Button>
                    </View>
                </Card>
            </View>
        </Overlay>
    )
}
