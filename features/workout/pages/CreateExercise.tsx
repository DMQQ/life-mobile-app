import Layout from "@/constants/Layout";
import ScreenContainer from "@/components/ui/ScreenContainer";
import CreateExerciseForm from "../components/CreateExerciseForm";
import { useNavigation } from "expo-router";

export default function ExerciseScreen() {
  const navigation = useNavigation()
  return (
    <ScreenContainer style={{ padding: 15 }} scroll>
      <CreateExerciseForm navigation={navigation} />
    </ScreenContainer>
  );
}
