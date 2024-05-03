import { gql, useMutation } from "@apollo/client";
import useGetTimelineById, { GET_TIMELINE } from "../query/useGetTimelineById";
import { useNavigation } from "@react-navigation/native";

const EDIT_TIMELINE = gql`
  mutation EditTimeline(
    $id: ID!
    $title: String!
    $desc: String!
    $date: String!
    $begin: String!
    $end: String!
    $tags: String!
  ) {
    editTimeline(
      id: $id
      input: {
        title: $title
        description: $desc
        date: $date
        beginTime: $begin
        endTime: $end
        tags: $tags
      }
    ) {
      id
      title
      description
      date
      beginTime
      endTime
      isCompleted
      isAllDay

      todos {
        id
        title
        isCompleted
      }

      images {
        id
        url
        type
      }
    }
  }
`;

export default function useEditTimeline(
  timelineId: string,
  isEditing: boolean
) {
  const { data } = useGetTimelineById(timelineId || "", {
    skip: !isEditing,
  });

  const navigation = useNavigation();

  const initialFormProps = {
    title: data?.title,
    desc: data?.description,
    date: data?.date,
    begin: data?.beginTime,
    end: data?.endTime,
    notification: "none",

    // These wont be changed
    tags: "UNTAGGED",
    repeatCount: "0",
    repeatUntil: "unspecified",
    repeatOn: "",
    repeatEveryNth: "",
  };

  const [edit] = useMutation(EDIT_TIMELINE, {
    update(cache, { data: { editTimeline } }) {
      cache.writeQuery({
        data: {
          timelineById: editTimeline,
        },
        query: GET_TIMELINE,
        variables: { id: timelineId },
        overwrite: true,
      });
    },

    onCompleted() {
      navigation.canGoBack() && navigation.goBack();
    },
  });

  const editTimeline = async (input: typeof initialFormProps, date: string) => {
    await edit({
      variables: {
        id: timelineId,
        title: input.title,
        desc: input.desc,
        begin: input.begin,
        end: input.end,
        tags: input.tags,
        date: date,
      },
    });
  };

  return { editTimeline, initialFormProps };
}
