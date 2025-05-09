import Header from "@/components/ui/Header/Header";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Search() {
  return (
    <SafeAreaView>
      <Header goBack title="Search" titleAnimatedStyle={{}} buttons={[]} />

      <ScreenContainer>
        <Text>Search</Text>
      </ScreenContainer>
    </SafeAreaView>
  );
}
