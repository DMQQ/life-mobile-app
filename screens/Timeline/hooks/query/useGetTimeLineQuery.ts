import { gql, useQuery } from "@apollo/client";
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

  todos: {
    id: string;
  }[];

  images: {
    id: string;
  }[];
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

      todos {
        id
      }

      images {
        id
      }
    }
  }
`;

export default function useGetTimeLineQuery(date?: string) {
  const [selected, setSelected] = useState(date || moment().format("YYYY-MM-DD"));
  const { data, loading, ...rest } = useQuery<{ timeline: GetTimelineQuery[] }>(GET_TIMELINE_QUERY, {
    variables: {
      date: selected,
    },
  });

  return { data, selected, setSelected, loading, ...rest };
}
