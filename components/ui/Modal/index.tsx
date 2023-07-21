import { ReactNode } from "react";
import { View, Text } from "react-native";
import RNModal, { ModalProps } from "react-native-modal";
import Layout from "../../../constants/Layout";

interface IModalProps extends Partial<ModalProps> {
  children: ReactNode;

  /**
   * Title of the modal header.
   */
  title?: string;

  /**
   * hide default container
   */
  showInnerContent?: boolean;
}

export default function Modal({
  children,
  title,
  showInnerContent,
  animationIn,
  animationOut,
  ...rest
}: IModalProps) {
  return (
    <RNModal
      animationIn={animationIn || "zoomInUp"}
      animationOut={animationOut || "zoomOutDown"}
      deviceHeight={Layout.screen.height}
      hardwareAccelerated
      statusBarTranslucent
      {...rest}
    >
      {showInnerContent ? (
        <View
          style={{
            padding: 10,
            borderRadius: 5,
          }}
        >
          {title && (
            <>
              <Text
                style={{
                  fontSize: 25,
                  fontWeight: "bold",
                  marginBottom: 5,
                  color: "#fff",
                }}
              >
                {title}
              </Text>
            </>
          )}

          {children}
        </View>
      ) : (
        <>{children}</>
      )}
    </RNModal>
  );
}
