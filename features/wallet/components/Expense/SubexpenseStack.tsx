import CollapsibleStack from "@/components/ui/CollapsableStack"
import React from "react"
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
            expandText="Expand"
            collapseText="Collapse"
        />
    )
}

export default SubexpenseStack
