import { FormikProps } from "formik";
import { TextInputProps as RNTextInputProps } from "react-native";
import TextInput, { InputProps } from "../TextInput/TextInput";

type OmitedTextInputProps = Omit<
  RNTextInputProps & InputProps,
  "onChangeText" | "onBlur" | "value" | "theme"
>;

interface ValidatedInputProps extends OmitedTextInputProps {
  /**
   * Formik props
   */
  formik: FormikProps<any>;

  /**
   * The name of the field in the formik state.
   */
  name: string;

  showLabel?: boolean;

  transformValueToNumber?: boolean;
}

export default function ValidatedInput({
  formik,
  name,
  showLabel = false,
  ...rest
}: ValidatedInputProps) {
  const { handleChange, handleBlur, errors, touched, values } = formik;

  const isError = !!errors[name] && !!touched[name];

  return (
    <TextInput
      {...rest}
      {...(showLabel && { name })}
      placeholderTextColor="gray"
      value={values[name].toString()}
      error={isError}
      helperText={isError ? errors?.[name]?.toString() : undefined}
      onBlur={handleBlur(name)}
      onChangeText={(text) =>
        handleChange(name)((rest.transformValueToNumber ? +text : text) as any)
      }
    />
  );
}

ValidatedInput.Icon = TextInput.Icon;
ValidatedInput.Label = TextInput.Label;
