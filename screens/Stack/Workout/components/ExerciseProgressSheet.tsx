import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import Colors from "../../../../constants/Colors";
import { Text, View, StyleSheet } from "react-native";
import { Exercise, ExerciseProgress } from "../../../../types";
import { useEffect, useRef, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import useUser from "../../../../utils/hooks/useUser";
import moment from "moment";
import Color from "color";
import Ripple from "react-native-material-ripple";
import { Formik } from "formik";
import ValidatedInput from "../../../../components/ui/ValidatedInput";
import Layout from "../../../../constants/Layout";
import Button from "../../../../components/ui/Button/Button";
import * as yup from "yup";
import useUpdateProgress from "../../../../components/Exercise/UpdateProgressModal/useUpdateProgress";

const GetExerciseProgressQuery = gql`
  query GetExerciseProgress($exerciseId: ID!) {
    exerciseProgress(exerciseId: $exerciseId) {
      exerciseProgressId
      date
      sets
      reps
      weight
    }
  }
`;

function useGetExerciseProgressQuery(exerciseId: string | undefined) {
  const usr = useUser();

  return useQuery(GetExerciseProgressQuery, {
    context: {
      headers: {
        token: usr.token,
      },
    },
    variables: {
      exerciseId: exerciseId,
    },

    skip: exerciseId === undefined,
  });
}

const styles = StyleSheet.create({
  title: { color: Colors.secondary, fontWeight: "bold", fontSize: 25 },
  overview: {
    width: "100%",
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
  },
  last: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: "bold",
  },
  weekly: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: "bold",
  },
  weeklyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  pr: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: "bold",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // padding: 10,
  },
  recentStatsText: {
    color: Colors.secondary,
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 1,
  },
  recentStatsBtn: {
    padding: 2.5,
    paddingHorizontal: 15,
    borderRadius: 100,
    backgroundColor: Colors.secondary,
  },
  recentStatsBtnText: {
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 1,
  },
});

interface ExerciseProgressSheetProps {
  selectedExercise: Exercise | undefined;
  onClearSelectedExercise: Function;
  workoutId: string;
}

export default function ExerciseProgressSheet(
  props: ExerciseProgressSheetProps
) {
  const sheetRef = useRef<BottomSheet | null>(null);

  const { data } = useGetExerciseProgressQuery(
    props.selectedExercise?.exerciseId
  );

  useEffect(() => {
    if (typeof props.selectedExercise !== "undefined") {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [props.selectedExercise]);

  const [isVisible, setIsVisible] = useState(false);

  const { onSubmit } = useUpdateProgress({
    exerciseId: props.selectedExercise?.exerciseId || "",
    workoutId: props.workoutId,
    onDismiss: () => {},
  });

  return (
    <BottomSheet
      onClose={() => props.onClearSelectedExercise()}
      ref={sheetRef}
      snapPoints={["80%"]}
      index={-1}
      backgroundStyle={{
        backgroundColor: Colors.primary,
      }}
      handleIndicatorStyle={{
        backgroundColor: Colors.secondary,
      }}
      // enableOverDrag
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          {...props}
        />
      )}
      style={{ padding: 10 }}
    >
      <Text style={styles.title}>{props.selectedExercise?.title}</Text>

      <Text style={{ color: "gray" }}>User made exercise</Text>

      <View style={{ marginTop: 10 }}>
        <View style={styles.listHeader}>
          <Text style={styles.recentStatsText}>Recent statistics</Text>

          <Ripple
            onPress={() => setIsVisible((p) => !p)}
            style={styles.recentStatsBtn}
          >
            <Text style={styles.recentStatsBtnText}>Add</Text>
          </Ripple>
        </View>
        {isVisible && (
          <CreateProgressForm
            onClose={() => setIsVisible(false)}
            onSubmit={onSubmit}
          />
        )}
      </View>

      <BottomSheetFlatList
        scrollEnabled
        data={(data?.exerciseProgress as ExerciseProgress[]) || []}
        keyExtractor={(item) => item.exerciseProgressId}
        renderItem={({ item }) => <ExerciseProgressTile {...item} />}
      />
    </BottomSheet>
  );
}

const ExerciseProgressTile = (props: ExerciseProgress) => {
  return (
    <View
      style={{
        padding: 15,
        flexDirection: "row",
      }}
    >
      <Text style={{ color: "#ffffffc3", flex: 1 }}>{props.date}</Text>
      <Text style={{ color: "#ffffffc3", flex: 1, textAlign: "center" }}>
        reps ({props.reps})
      </Text>
      <Text style={{ color: "#ffffffc3", flex: 1, textAlign: "center" }}>
        sets ({props.sets})
      </Text>
      <Text
        style={{
          color: "#ffffffc3",
          flex: 1,
          textAlign: "right",
          paddingRight: 10,
        }}
      >
        {props.weight} kg
      </Text>
    </View>
  );
};

const validationSchema = yup.object().shape({
  reps: yup.string().required(),
  sets: yup.string().required(),
  weight: yup.string().required(),
});

const CreateProgressForm = (props: {
  onSubmit: (vals: unknown) => Promise<unknown>;
  onClose: Function;
}) => {
  const style = {
    width: Layout.screen.width - 20,
    marginLeft: 10,
  };

  return (
    <Formik
      validationSchema={validationSchema}
      onSubmit={props.onSubmit}
      initialValues={{
        reps: "",
        sets: "",
        weight: "",
      }}
    >
      {(f) => (
        <View>
          <View
            style={{
              //  flexDirection: "row",
              width: Layout.screen.width - 20,
              marginTop: 10,
            }}
          >
            <ValidatedInput
              style={style}
              formik={f}
              name="reps"
              placeholder="Reps"
              keyboardType="numeric"
              keyboardAppearance="dark"
            />
            <ValidatedInput
              style={style}
              formik={f}
              name="sets"
              placeholder="Sets"
              keyboardType="numeric"
              keyboardAppearance="dark"
            />
            <ValidatedInput
              style={style}
              formik={f}
              name="weight"
              placeholder="Weight [kg/lbs]"
              keyboardType="numeric"
              keyboardAppearance="dark"
            />
          </View>
          <Button
            onPress={() => {
              f.handleSubmit();
              f.resetForm();
              props.onClose();
            }}
            style={{ padding: 15, borderRadius: 100 }}
            type="contained"
            color="ternary"
          >
            Save
          </Button>
        </View>
      )}
    </Formik>
  );
};
