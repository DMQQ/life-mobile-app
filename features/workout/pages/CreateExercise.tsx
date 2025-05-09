import Layout from "@/constants/Layout";
import ScreenContainer from "@/components/ui/ScreenContainer";
import CreateExerciseForm from "../components/CreateExerciseForm";
import { WorkoutScreenProps } from "../types";

export default function ExerciseScreen({ navigation }: WorkoutScreenProps<"Exercise">) {
  return (
    <ScreenContainer style={{ padding: 15 }} scroll>
      <CreateExerciseForm navigation={navigation} />
    </ScreenContainer>
  );
}
