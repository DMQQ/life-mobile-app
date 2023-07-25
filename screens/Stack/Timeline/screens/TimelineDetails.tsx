import { Text, View } from "react-native";
import ScreenContainer from "../../../../components/ui/ScreenContainer";
import { StackScreenProps } from "../../../../types";
import { useLayoutEffect } from "react";
import { gql, useMutation } from "@apollo/client";
import useUser from "../../../../utils/hooks/useUser";
import Colors from "../../../../constants/Colors";
import Color from "color";
import FileList from "../components/FileList";
import useGetTimelineById, {
  GET_TIMELINE,
} from "../hooks/query/useGetTimelineById";
import Ripple from "react-native-material-ripple";
import Layout from "../../../../constants/Layout";
import { AntDesign, Feather } from "@expo/vector-icons";
import TimelineTodos from "../components/TimelineTodos";
import LoaderSkeleton from "../components/LoaderSkeleton";
import useGoBackOnBackPress from "../../../../utils/hooks/useGoBackOnBackPress";

const COMPLETE_TIMELINE = gql`
  mutation CompleteTimeline($id: String!) {
    completeTimeline(id: $id) {
      id
      title
      description
      date
      beginTime
      endTime
      isCompleted
      isAllDay
    }
  }
`;

const Header = (props: {
  navigation: any;
  isCompleted: boolean;
  onTaskToggle: Function;
}) => (
  <View
    style={{
      width: Layout.screen.width,
      height: 70,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
    }}
  >
    <Ripple onPress={() => props.navigation.goBack()}>
      <AntDesign name="arrowleft" size={20} color={"#fff"} />
    </Ripple>

    <Ripple style={{ flexDirection: "row", alignItems: "center" }}>
      <Feather name="edit" size={18} color={Colors.secondary} />
      <Text style={{ color: Colors.secondary, fontSize: 16, marginLeft: 2.5 }}>
        Edit
      </Text>
    </Ripple>
  </View>
);

export default function TimelineDetails({
  route,
  navigation,
}: StackScreenProps<
  { TimelineDetails: { timelineId: string } },
  "TimelineDetails"
>) {
  const usr = useUser();

  const ctx = {
    context: {
      headers: {
        authentication: usr?.token,
      },
    },
  };

  const { data, loading } = useGetTimelineById(route.params.timelineId);

  const [completeTimeline] = useMutation(COMPLETE_TIMELINE, {
    ...ctx,
    variables: {
      id: route.params.timelineId,
    },
    refetchQueries: [
      { query: GET_TIMELINE, variables: { id: route.params.timelineId } },
    ],
    onError(err) {
      console.log(JSON.stringify(err, null, 2));
    },
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: data?.title,
      header: (props) => (
        <Header
          isCompleted={data?.isCompleted}
          onTaskToggle={completeTimeline}
          {...props}
        />
      ),
    });
  }, [data?.title, data?.isCompleted]);

  useGoBackOnBackPress();

  return (
    <ScreenContainer scroll style={{ padding: 10 }}>
      {loading ? (
        <LoaderSkeleton />
      ) : (
        <View>
          <Text
            style={{
              marginBottom: 5,
              fontSize: 30,
              fontWeight: "bold",
              color: Colors.secondary,
            }}
          >
            {data?.title}
          </Text>

          <Text
            style={{
              fontSize: 20,
              marginTop: 5,
              color: Color(Colors.primary).lighten(3).string(),
            }}
          >
            {data?.description}
          </Text>

          <TimelineTodos timelineId={data?.id} todos={data?.todos || []} />

          <FileList timelineId={data?.id} />
        </View>
      )}
    </ScreenContainer>
  );
}
