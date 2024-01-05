import { useMutation } from "@apollo/client";
import useUser from "../../../../../utils/hooks/useUser";
import { CREATE_TIMELINE_EVENT } from "../schemas/schemas";
import { GET_TIMELINE_QUERY } from "../query/useGetTimeLineQuery";
import { Timeline } from "../../../../../types";
import { useNavigation } from "@react-navigation/native";

import { ToastAndroid } from "react-native";

import * as Yup from "yup";

const initialValues = {
  title: "",
  desc: "",
  date: "",
  begin: "",
  end: "",
  tags: "UNTAGGED",
  repeatCount: "0",
  repeatUntil: "unspecified",
  repeatOn: "",
  repeatEveryNth: "",
};

export type InitialValuesType = typeof initialValues;

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  desc: Yup.string().required("Description is required"),
  date: Yup.string().required("Date is required"),
  begin: Yup.string().required("Begin time is required"),
  end: Yup.string().required("End time is required"),
  tags: Yup.string().required("Tags are required"),

  // repeatCount: Yup.number().positive(),
  // repeatOn: Yup.string().equals(["daily", "weekly"]),
  // repeatEveryNth: Yup.number().positive(),
});

export default function useCreateTimeline(props: { selectedDate: string }) {
  const usr = useUser();

  const navigation = useNavigation<any>();

  const [createTimelineEvent, state] = useMutation(CREATE_TIMELINE_EVENT, {
    context: {
      headers: {
        authentication: usr.token,
      },
    },
  });

  const handleSubmit = async (input: typeof initialValues) => {
    const { data, errors } = await createTimelineEvent({
      variables: {
        title: input.title,
        desc: input.desc,
        begin: input.begin,
        end: input.end,
        tags: input.tags,
        date: props.selectedDate,

        ...(input.repeatCount &&
          input.repeatOn !== "" && {
            repeatCount: parseInt(input.repeatCount),
            repeatUntil: "unspecified",
            repeatOn: input.repeatOn,
            repeatEveryNth: parseInt(input.repeatEveryNth),
          }),
      },

      update(cache, { data: { createTimeline } }) {
        const { timeline } = cache.readQuery({
          query: GET_TIMELINE_QUERY,
          variables: { date: props.selectedDate },
        }) as { timeline: Timeline[] };

        cache.writeQuery({
          query: GET_TIMELINE_QUERY,
          variables: { date: props.selectedDate },
          data: { timeline: [createTimeline, ...timeline] },
          overwrite: true,
        });
      },

      onError: (err) => {
        ToastAndroid.show("Creating timeline failed", ToastAndroid.LONG);
      },
    });

    navigation.replace("TimelineDetails", {
      timelineId: (data?.createTimeline as Timeline).id,
    });
  };

  return { initialValues, handleSubmit, validationSchema, state };
}
