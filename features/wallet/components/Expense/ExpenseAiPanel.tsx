import { Expense } from "@/types"
import AskAiSheetNative, { AskAiSheetNativeRef } from "@/features/ai/components/AskAiSheetNative"

interface Props {
    expense: Expense
    tint: string

    ref: React.Ref<AskAiSheetNativeRef> | undefined
}

const QUICK_PROMPTS = ["Summarize this expense", "Is this amount typical?", "Compare to last month"]

export default function ExpenseAiPanel({ expense, tint, ref }: Props) {
    return (
        <AskAiSheetNative
            ref={ref}
            contextType="expense"
            contextId={expense.id}
            tint={tint}
            quickPrompts={QUICK_PROMPTS}
            placeholder="Ask about this expense…"
            label="AI Assistant"
        />
    )
}
