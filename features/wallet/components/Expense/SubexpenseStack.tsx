import CollapsibleStack from "@/components/ui/CollapsableStack"
import Colors from "@/constants/Colors"
import React from "react"
import { StyleSheet } from "react-native"
import WalletItem from "../Wallet/WalletItem"

interface SubExpense {
    id: string
    description: string
    amount: number
    category: string
    [key: string]: any
}

interface Selected {
    subexpenses: SubExpense[]
    [key: string]: any
}

interface SubexpenseStackProps {
    selected: Selected
    handleDeleteSubExpense: (id: string) => void
}

const SubexpenseStack: React.FC<SubexpenseStackProps> = ({ selected, handleDeleteSubExpense }) => {
    const subexpenses = selected?.subexpenses || []

    const renderSubexpenseItem = ({
        item,
        isExpanded,
        onDelete,
        expand,
    }: {
        item: SubExpense
        index: number
        isExpanded: boolean
        totalCount: number
        onDelete: () => void
        expand: () => void
    }) => (
        <WalletItem
            {...selected}
            {...(item as any)}
            handlePress={isExpanded ? onDelete : expand}
            subexpenses={[]}
            files={[]}
        />
    )

    const handleDeleteItem = (item: SubExpense, index: number) => {
        handleDeleteSubExpense(item.id)
    }

    const getItemKey = (item: SubExpense, index: number) => item.id

    return (
        <CollapsibleStack
            items={subexpenses}
            title="Subexpenses"
            onDeleteItem={handleDeleteItem}
            renderItem={renderSubexpenseItem}
            getItemKey={getItemKey}
            animation={{
                maxVisibleItems: 3,
                stackSpacing: 20,
            }}
            styles={{
                container: styles.container,
                header: styles.header,
                title: styles.title,
                expandButton: styles.expandButton,
                expandButtonText: styles.expandButtonText,
            }}
            expandText="Expand"
            collapseText="Collapse"
        />
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 15,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
        zIndex: 2,
    },
    title: {
        color: Colors.foreground,
        fontSize: 20,
        fontWeight: "bold",
        lineHeight: 27.5,
    },
    expandButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primary_light,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        zIndex: 5,
    },
    expandButtonText: {
        color: "rgba(255,255,255,0.7)",
        marginRight: 5,
    },
})

export default SubexpenseStack
