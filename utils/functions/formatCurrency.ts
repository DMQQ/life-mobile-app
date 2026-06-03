const fmt = (decimals: number) =>
    new Intl.NumberFormat("pl-PL", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    })

const f0 = fmt(0)
const f1 = fmt(1)
const f2 = fmt(2)

export function formatAmount(value: number, decimals: 0 | 1 | 2 = 2): string {
    if (decimals === 0) return f0.format(value)
    if (decimals === 1) return f1.format(value)
    return f2.format(value)
}
