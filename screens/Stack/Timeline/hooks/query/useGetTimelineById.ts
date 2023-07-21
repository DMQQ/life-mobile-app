import { gql, useLazyQuery, useQuery } from "@apollo/client";

import useUser from "../../../../../utils/hooks/useUser";

export const GET_TIMELINE = gql`
  query GetTimeline($id: String!) {
    timelineById(id: $id) {
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

export default function useGetTimelineById(id: string, headers?: Object) {
  const usr = useUser();

  const ctx = {
    context: {
      headers: {
        authentication: usr?.token,
      },
    },
  };

  const { data, refetch, loading } = useQuery(GET_TIMELINE, {
    ...ctx,
    variables: {
      id,
    },
    onError(err) {
      console.log(JSON.stringify(err, null, 2));
    },
    ...headers,
  });

  return { data: data?.timelineById, refetch, loading };
}

export const useGetTimelineByIdLazy = (id: string) => {
  const usr = useUser();

  const ctx = {
    context: {
      headers: {
        authentication: usr?.token,
      },
    },
  };

  const [reload, { data }] = useLazyQuery(GET_TIMELINE, {
    ...ctx,
    variables: {
      id,
    },
  });

  return { data: data?.timelineById, reload };
};
