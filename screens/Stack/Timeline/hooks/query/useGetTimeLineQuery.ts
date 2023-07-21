import { gql, useQuery } from "@apollo/client";
import useUser from "../../../../../utils/hooks/useUser";
import moment from "moment";
import { useState } from "react";

export interface GetTimelineQuery {
  id: string;
  title: string;
  description: string;
  date: string;
  beginTime: string;
  endTime: string;
  isCompleted: boolean;
}

export const GET_TIMELINE_QUERY = gql`
  query GetTimeline($date: String) {
    timeline(date: $date) {
      id
      title
      description
      date
      beginTime
      endTime
      isCompleted
    }
  }
`;

export default function useGetTimeLineQuery() {
  const [selected, setSelected] = useState(moment().format("YYYY-MM-DD"));
  const usr = useUser();

  const { data, loading, ...rest } = useQuery<{ timeline: GetTimelineQuery[] }>(
    GET_TIMELINE_QUERY,
    {
      context: {
        headers: {
          authentication: usr.token,
        },
      },
      variables: {
        date: selected,
      },
    }
  );

  return { data, selected, setSelected, loading, ...rest };
}
