import { Expense } from "@/types"
import AskAiSheet from "@/features/ai/components/AskAiSheet"

interface Props {
    expense: Expense
    tint: string
}

const QUICK_PROMPTS = ["Summarize this expense", "Is this amount typical?", "Compare to last month"]

export default function ExpenseAiPanel({ expense, tint }: Props) {
    return (
        <AskAiSheet
            contextType="expense"
            contextId={expense.id}
            tint={tint}
            quickPrompts={QUICK_PROMPTS}
            placeholder="Ask about this expense…"
            label="AI Assistant"
        />
    )
}
