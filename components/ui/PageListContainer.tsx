import { SafeAreaView } from "react-native-safe-area-context"

export default function PageListContainer({ children }: { children: React.ReactNode }) {
    return <SafeAreaView>{children}</SafeAreaView>
}
