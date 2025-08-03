import Text from "@/components/ui/Text/Text"
import { useState } from "react"
import { View } from "react-native"

export default function TodosTransferModal() {
    const [dialogText, setDialogText] = useState("")

    return (
        <View style={{ flex: 1, padding: 15 }}>
            <Text variant="title" style={{ marginBottom: 10 }}>
                Transfer Todos
            </Text>

            <Text>to be implemented. display list of events to transfer to</Text>
        </View>
    )
}
