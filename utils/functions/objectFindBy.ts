export default function objectFindBy<T>(obj: Record<string, T> | undefined, key: string): T | undefined {
    if (!obj) return undefined
    for (const k in obj) {
        if (k === key) {
            return obj[k]
        } else {
            if (typeof obj[k] === "object") {
                return objectFindBy(obj[k] as unknown as Record<string, T>, key)
            }
        }
    }
}
