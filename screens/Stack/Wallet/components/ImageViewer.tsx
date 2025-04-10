import { Modal, View, StyleSheet, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GesturedImage } from "../../Timeline/pages/ImagesPreview";

const ImageViewerModal = ({ selectedImage, onClose }: any) => {
  const insets = useSafeAreaInsets();

  if (!selectedImage) return null;

  return (
    <Modal transparent visible={selectedImage != null} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={[styles.closeButton, { top: insets.top + 10 }]} onPress={onClose}>
          <AntDesign name="close" size={24} color="#fff" />
        </TouchableOpacity>

        <GesturedImage uri={selectedImage} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: "absolute",
    left: 10,
    zIndex: 1000,
    padding: 5,
  },
});

export default ImageViewerModal;
