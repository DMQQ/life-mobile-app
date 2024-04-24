import { ReactNode, forwardRef, useCallback } from "react";
import BottomSheetGorhom, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Keyboard } from "react-native";
import Colors from "@/constants/Colors";

const BottomSheet = forwardRef<
  Omit<BottomSheetGorhom, "snapPoints">,
  {
    snapPoints: (string | number)[];
    children: ReactNode;
    onChange?: (index: number) => void;
  } & Partial<BottomSheetGorhom>
>((props, ref) => {
  const backdropComponent = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
      />
    ),
    []
  );

  return (
    <BottomSheetGorhom
      index={-1}
      backdropComponent={backdropComponent}
      snapPoints={props.snapPoints}
      ref={ref}
      onChange={(index) => {
        index === -1 && Keyboard.dismiss();
        props.onChange?.(index);
      }}
      handleIndicatorStyle={{
        backgroundColor: Colors.secondary,
        margin: 5,
        width: 40,
      }}
      backgroundStyle={{
        backgroundColor: Colors.primary,
      }}
      enablePanDownToClose
    >
      {props.children}
    </BottomSheetGorhom>
  );
});

export { BottomSheetGorhom };

export default BottomSheet;
