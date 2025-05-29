import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetFlatList } from "@gorhom/bottom-sheet";
import Colors from "@/constants/Colors";
import { Text, View, StyleSheet } from "react-native";
import { Exercise, ExerciseProgress } from "@/types";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Ripple from "react-native-material-ripple";
import { Formik } from "formik";
import ValidatedInput from "@/components/ui/ValidatedInput";
import Layout from "@/constants/Layout";
import Button from "@/components/ui/Button/Button";
import * as yup from "yup";
import useUpdateProgress from "@/components/Exercise/UpdateProgressModal/useUpdateProgress";
import useGetExerciseProgressQuery from "../hooks/useGetExerciseProgressQuery";
import Animated, { FadeInDown, FadeInUp, FadeOutDown } from "react-native-reanimated";
import moment from "moment";

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

function ExerciseProgressSheet(props: ExerciseProgressSheetProps) {
  const sheetRef = useRef<BottomSheet | null>(null);

  const data = useGetExerciseProgressQuery(props.selectedExercise?.exerciseId);

  useEffect(() => {
    if (typeof props.selectedExercise !== "undefined") {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
      setIsVisible(false); // close modal form
    }
  }, [props.selectedExercise]);

  const [isVisible, setIsVisible] = useState(false);

  const { onSubmit } = useUpdateProgress({
    exerciseId: props.selectedExercise?.exerciseId || "",
    workoutId: props.workoutId,
    onDismiss: () => setIsVisible(false),
  });

  // fixes backdrop flickering on state change
  const backdropComponent = useCallback(
    (props: BottomSheetBackdropProps) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    []
  );

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
      backdropComponent={backdropComponent}
      style={{ padding: 10 }}
    >
      <Text style={styles.title}>{props.selectedExercise?.title}</Text>

      <Text style={{ color: "gray" }}>User made exercise</Text>

      <View style={{ marginTop: 10 }}>
        <View style={styles.listHeader}>
          <Text style={styles.recentStatsText}>Recent statistics</Text>

          <Ripple onPress={() => setIsVisible((p) => !p)} style={styles.recentStatsBtn}>
            <Text style={styles.recentStatsBtnText}>Add</Text>
          </Ripple>
        </View>
        {isVisible && <CreateProgressForm onClose={() => setIsVisible(false)} onSubmit={onSubmit as any} />}
      </View>

      <BottomSheetFlatList
        scrollEnabled
        data={data}
        keyExtractor={(item) => item.exerciseProgressId}
        renderItem={({ item }) => <ExerciseProgressTile {...item} />}
      />
    </BottomSheet>
  );
}

export default memo(ExerciseProgressSheet);

const ExerciseProgressTile = (props: ExerciseProgress) => {
  const date = useMemo(() => {
    if (moment(props.date).isSame(moment().subtract(1, "day"), "date")) return "Yesterday";

    if (moment(props.date).isSame(moment(), "date")) return "Today";

    return props.date;
  }, [props.date]);

  return (
    <View
      style={{
        padding: 15,
        flexDirection: "row",
      }}
    >
      <Text style={{ color: "#ffffffc3", flex: 1 }}>{date}</Text>
      <Text style={{ color: "#ffffffc3", flex: 1, textAlign: "center" }}>reps ({props.reps})</Text>
      <Text style={{ color: "#ffffffc3", flex: 1, textAlign: "center" }}>sets ({props.sets})</Text>
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

const CreateProgressForm = (props: { onSubmit: (vals: unknown) => Promise<unknown>; onClose: Function }) => {
  const style = {
    width: (Layout.screen.width - 20) / 2 - 5,
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
        <View style={{ marginTop: 10 }}>
          <Animated.View
            exiting={FadeOutDown.delay(100)}
            entering={FadeInDown}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <ValidatedInput style={style} formik={f} name="reps" placeholder="Reps" keyboardType="numeric" keyboardAppearance="dark" />
            <ValidatedInput style={style} formik={f} name="sets" placeholder="Sets" keyboardType="numeric" keyboardAppearance="dark" />
          </Animated.View>
          <Animated.View exiting={FadeOutDown.delay(50)} entering={FadeInDown.delay(50)}>
            <ValidatedInput
              style={{ width: "100%" }}
              formik={f}
              name="weight"
              placeholder="Weight [kg/lbs]"
              keyboardType="numeric"
              keyboardAppearance="dark"
            />
          </Animated.View>

          <Animated.View exiting={FadeOutDown.delay(0)} entering={FadeInDown.delay(75)}>
            <Button
              disabled={!(f.dirty && f.isValid)}
              onPress={() => {
                f.handleSubmit();
              }}
              style={{ padding: 15, borderRadius: 100 }}
              type="contained"
              color="ternary"
            >
              Save
            </Button>
          </Animated.View>
        </View>
      )}
    </Formik>
  );
};
