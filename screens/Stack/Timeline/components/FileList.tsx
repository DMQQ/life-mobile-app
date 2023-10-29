import {
  FlatList,
  Image,
  Text,
  View,
  ActivityIndicator,
  ToastAndroid,
  StyleSheet,
} from "react-native";
import Colors from "../../../../constants/Colors";
import Ripple from "react-native-material-ripple";
import { useState, useRef } from "react";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useApolloClient } from "@apollo/client";
import useGetTimelineById from "../hooks/query/useGetTimelineById";
import { useNavigation } from "@react-navigation/native";
import Url from "../../../../constants/Url";

const styles = StyleSheet.create({
  available: {
    color: Colors.secondary,
    fontSize: 19,
    fontWeight: "bold",
  },
  img: {
    width: 175,
    height: 120,
    marginVertical: 10,
    borderRadius: 5,
  },
  uploadButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 100,
    padding: 5,
    paddingHorizontal: 10,
    flexDirection: "row",
  },
});

interface FileListProps {
  timelineId: string;
}

const useUploadFiles = (timelineId: string, refetch: () => Promise<any>) => {
  const client = useApolloClient();

  async function uploadPhotoAsync(photos: ImagePicker.ImagePickerResult) {
    const formData = new FormData() as any;

    if (photos.assets?.length === 0 || photos.canceled) return;

    photos.assets?.forEach((photo) => {
      formData.append("file", {
        uri: photo.uri,
        name: "File",
        type: "image/jpg",
      });
    });

    try {
      setLoading(true);

      const { data } = await axios.post(Url.API + "/upload", formData, {
        params: {
          type: "timeline",
          timelineId: timelineId,
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      client.cache.modify({
        id: "TimelineEntity:" + timelineId,
        fields: {
          images: (existingImages = []) => {
            return [...data, ...existingImages];
          },
        },
      });

      ToastAndroid.show(`Files uploaded (${data.length})`, ToastAndroid.SHORT);
    } catch (error) {
      console.log(JSON.stringify(error, null, 2));

      ToastAndroid.show(`Couldn't upload file`, ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  }

  const [loading, setLoading] = useState(false);

  const handleImagesSelect = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
    });

    await uploadPhotoAsync(result);
  };

  return { handleImagesSelect, loading };
};

export default function FileList({ timelineId }: FileListProps) {
  const navigation = useNavigation<any>();

  const { data, refetch } = useGetTimelineById(timelineId, {
    fetchPolicy: "cache-only",
  });

  const listRef = useRef<FlatList | null>();

  async function removePhoto(photoId: string) {
    await axios.delete(Url.API + "/upload/" + photoId);
    await refetch();
  }

  const handleShowPreview = (item: any) =>
    navigation.navigate("ImagesPreview", {
      selectedImage: item.url,
      timelineId,
    });

  return (
    <View style={{ marginTop: 25 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.available}>
          Available files ({data?.images.length})
        </Text>
        <UploadFileButton refetch={refetch} timelineId={timelineId} />
      </View>
      <FlatList
        initialNumToRender={3}
        ref={(r) => (listRef.current = r)}
        data={data?.images}
        horizontal
        keyExtractor={(el) => el.id}
        renderItem={({ item }) => (
          <Ripple
            style={{ marginRight: 10 }}
            onLongPress={() => removePhoto(item.id)}
            onPress={handleShowPreview}
          >
            <Image
              style={styles.img}
              source={{
                uri: Url.API + "/upload/images/" + item.url,
                height: 120,
                width: 175,
                cache: "only-if-cached",
                method: "GET",
              }}
            />
          </Ripple>
        )}
      />
    </View>
  );
}

function UploadFileButton(props: {
  timelineId: string;
  refetch: () => Promise<any>;
}) {
  const { handleImagesSelect, loading } = useUploadFiles(
    props.timelineId,
    props.refetch
  );

  return (
    <Ripple onPress={handleImagesSelect} style={styles.uploadButton}>
      {loading && (
        <ActivityIndicator
          color={Colors.primary}
          style={{ marginRight: 5 }}
          size={15}
        />
      )}

      <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: "bold" }}>
        {loading ? "Uploading..." : "Upload files"}
      </Text>
    </Ripple>
  );
}
