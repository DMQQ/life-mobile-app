// src/hooks/useFlashcards.ts
import { gql, useQuery, useMutation, ApolloError } from "@apollo/client";
import { useState, useCallback } from "react";

// Types
export interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface FlashCard {
  id: string;
  question: string;
  answer: string;
  explanation?: string;
  timesReviewed: number;
  correctAnswers: number;
  incorrectAnswers: number;
  successRate: number;
  lastReviewedAt?: string;
  difficultyLevel: number;
  group: Group;
  createdAt: string;
}

interface GroupStats {
  totalCards: number;
  averageSuccessRate: number;
  totalReviewed: number;
  masteredCards: number;
}

interface CreateGroupInput {
  name: string;
  description?: string;
}

interface UpdateGroupInput {
  id: string;
  name?: string;
  description?: string;
}

interface CreateFlashCardInput {
  question: string;
  answer: string;
  explanation?: string;
  groupId: string;
}

interface UpdateFlashCardInput {
  id: string;
  question?: string;
  answer?: string;
  explanation?: string;
  difficultyLevel?: number;
}

// Query Response Types
interface GroupsQueryResponse {
  groups: Group[];
}

interface GroupQueryResponse {
  group: Group & { flashcards: FlashCard[] };
}

interface FlashCardsQueryResponse {
  flashCards: FlashCard[];
}

interface FlashCardQueryResponse {
  flashCard: FlashCard;
}

interface GroupStatsQueryResponse {
  groupStats: GroupStats;
}

// Mutation Response Types
interface CreateGroupMutationResponse {
  createGroup: Group;
}

interface UpdateGroupMutationResponse {
  updateGroup: Group;
}

interface DeleteGroupMutationResponse {
  removeGroup: boolean;
}

interface CreateFlashCardMutationResponse {
  createFlashCard: FlashCard;
}

interface UpdateFlashCardMutationResponse {
  updateFlashCard: FlashCard;
}

interface ReviewFlashCardMutationResponse {
  reviewFlashCard: FlashCard;
}

interface DeleteFlashCardMutationResponse {
  removeFlashCard: boolean;
}

// Fragments
const GROUP_FIELDS = gql`
  fragment GroupFields on Group {
    id
    name
    description
    createdAt
  }
`;

const FLASHCARD_FIELDS = gql`
  fragment FlashCardFields on FlashCard {
    id
    question
    answer
    explanation
    timesReviewed
    correctAnswers
    incorrectAnswers
    successRate
    lastReviewedAt
    difficultyLevel
    group {
      ...GroupFields
    }
    createdAt
  }
  ${GROUP_FIELDS}
`;

// Group Queries & Mutations
const GET_GROUPS = gql`
  query GetGroups {
    groups {
      ...GroupFields
    }
  }
  ${GROUP_FIELDS}
`;

const GET_GROUP = gql`
  query GetGroup($id: ID!) {
    group(id: $id) {
      ...GroupFields
      flashcards {
        ...FlashCardFields
      }
    }
  }
  ${GROUP_FIELDS}
  ${FLASHCARD_FIELDS}
`;

const CREATE_GROUP = gql`
  mutation CreateGroup($input: CreateGroupInput!) {
    createGroup(createGroupInput: $input) {
      ...GroupFields
    }
  }
  ${GROUP_FIELDS}
`;

const UPDATE_GROUP = gql`
  mutation UpdateGroup($input: UpdateGroupInput!) {
    updateGroup(updateGroupInput: $input) {
      ...GroupFields
    }
  }
  ${GROUP_FIELDS}
`;

const DELETE_GROUP = gql`
  mutation DeleteGroup($id: ID!) {
    removeGroup(id: $id)
  }
`;

// Flashcard Queries & Mutations
const GET_FLASHCARDS = gql`
  query GetFlashCards($groupId: ID) {
    flashCards(groupId: $groupId) {
      ...FlashCardFields
    }
  }
  ${FLASHCARD_FIELDS}
`;

const GET_GROUP_STATS = gql`
  query GetGroupStats($groupId: ID!) {
    groupStats(groupId: $groupId) {
      totalCards
      averageSuccessRate
      totalReviewed
      masteredCards
    }
  }
`;

const CREATE_FLASHCARD = gql`
  mutation CreateFlashCard($input: CreateFlashCardInput!) {
    createFlashCard(input: $input) {
      ...FlashCardFields
    }
  }
  ${FLASHCARD_FIELDS}
`;

const UPDATE_FLASHCARD = gql`
  mutation UpdateFlashCard($input: UpdateFlashCardInput!) {
    updateFlashCard(input: $input) {
      ...FlashCardFields
    }
  }
  ${FLASHCARD_FIELDS}
`;

const REVIEW_FLASHCARD = gql`
  mutation ReviewFlashCard($input: ReviewFlashCardInput!) {
    reviewFlashCard(input: $input) {
      ...FlashCardFields
    }
  }
  ${FLASHCARD_FIELDS}
`;

const DELETE_FLASHCARD = gql`
  mutation DeleteFlashCard($id: ID!) {
    removeFlashCard(id: $id)
  }
`;

// Hook Return Types
interface UseGroupsReturn {
  groups: Group[];
  loading: boolean;
  error: ApolloError | null;
  refetch: () => Promise<any>;
  createGroup: (input: CreateGroupInput) => Promise<Group>;
  updateGroup: (input: UpdateGroupInput) => Promise<Group>;
  deleteGroup: (id: string) => Promise<boolean>;
}

interface UseFlashCardsReturn {
  flashCards: FlashCard[];
  groupStats: GroupStats | null;
  loading: boolean;
  error: ApolloError | null;
  refetch: () => Promise<any>;
  createFlashCard: (input: Omit<CreateFlashCardInput, "groupId">) => Promise<FlashCard>;
  updateFlashCard: (input: UpdateFlashCardInput) => Promise<FlashCard>;
  reviewFlashCard: (id: string, isCorrect: boolean) => Promise<FlashCard>;
  deleteFlashCard: (id: string) => Promise<boolean>;
}

// Groups Hook
export const useGroups = (): UseGroupsReturn => {
  const [error, setError] = useState<ApolloError | null>(null);

  const { data, loading, refetch } = useQuery<GroupsQueryResponse>(GET_GROUPS, {
    onError: setError,
  });

  const [createGroupMutation] = useMutation<CreateGroupMutationResponse, { input: CreateGroupInput }>(CREATE_GROUP, {
    refetchQueries: [{ query: GET_GROUPS }],
  });

  const [updateGroupMutation] = useMutation<UpdateGroupMutationResponse, { input: UpdateGroupInput }>(UPDATE_GROUP);

  const [deleteGroupMutation] = useMutation<DeleteGroupMutationResponse, { id: string }>(DELETE_GROUP, {
    refetchQueries: [{ query: GET_GROUPS }],
  });

  const createGroup = useCallback(
    async (input: CreateGroupInput): Promise<Group> => {
      try {
        const { data } = await createGroupMutation({
          variables: { input },
        });
        return data!.createGroup;
      } catch (err) {
        setError(err as ApolloError);
        throw err;
      }
    },
    [createGroupMutation]
  );

  const updateGroup = useCallback(
    async (input: UpdateGroupInput): Promise<Group> => {
      try {
        const { data } = await updateGroupMutation({
          variables: { input },
        });
        return data!.updateGroup;
      } catch (err) {
        setError(err as ApolloError);
        throw err;
      }
    },
    [updateGroupMutation]
  );

  const deleteGroup = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { data } = await deleteGroupMutation({
          variables: { id },
        });
        return data!.removeGroup;
      } catch (err) {
        setError(err as ApolloError);
        throw err;
      }
    },
    [deleteGroupMutation]
  );

  return {
    groups: data?.groups || [],
    loading,
    error,
    refetch,
    createGroup,
    updateGroup,
    deleteGroup,
  };
};

export const useGroupStats = (groupId: string) => {
  return useQuery<GroupStatsQueryResponse>(GET_GROUP_STATS, {
    variables: { groupId },
  });
};

// Flashcards Hook
export const useFlashCards = (groupId?: string): UseFlashCardsReturn => {
  const [error, setError] = useState<ApolloError | null>(null);

  const { data, loading, refetch } = useQuery<FlashCardsQueryResponse>(GET_FLASHCARDS, {
    variables: groupId ? { groupId } : undefined,
    onError: setError,
  });

  const { data: statsData, loading: statsLoading } = useQuery<GroupStatsQueryResponse>(GET_GROUP_STATS, {
    variables: { groupId },
  });

  const [createFlashCardMutation] = useMutation<CreateFlashCardMutationResponse, { input: CreateFlashCardInput }>(CREATE_FLASHCARD, {
    refetchQueries: [
      { query: GET_FLASHCARDS, variables: { groupId } },
      { query: GET_GROUP_STATS, variables: { groupId } },
    ],
  });

  const [updateFlashCardMutation] = useMutation<UpdateFlashCardMutationResponse, { input: UpdateFlashCardInput }>(UPDATE_FLASHCARD);

  const [reviewFlashCardMutation] = useMutation<ReviewFlashCardMutationResponse, { input: { id: string; isCorrect: boolean } }>(
    REVIEW_FLASHCARD
  );

  const [deleteFlashCardMutation] = useMutation<DeleteFlashCardMutationResponse, { id: string }>(DELETE_FLASHCARD, {
    refetchQueries: [{ query: GET_FLASHCARDS, variables: { groupId } }],
  });

  const createFlashCard = useCallback(
    async ({ question, answer, explanation }: Omit<CreateFlashCardInput, "groupId">): Promise<FlashCard> => {
      if (!groupId) throw new Error("Group ID is required");
      try {
        const { data } = await createFlashCardMutation({
          variables: {
            input: { question, answer, explanation, groupId },
          },
        });
        return data!.createFlashCard;
      } catch (err) {
        setError(err as ApolloError);
        throw err;
      }
    },
    [createFlashCardMutation, groupId]
  );

  const updateFlashCard = useCallback(
    async (input: UpdateFlashCardInput): Promise<FlashCard> => {
      try {
        const { data } = await updateFlashCardMutation({
          variables: { input },
        });
        return data!.updateFlashCard;
      } catch (err) {
        setError(err as ApolloError);
        throw err;
      }
    },
    [updateFlashCardMutation]
  );

  const reviewFlashCard = useCallback(
    async (id: string, isCorrect: boolean): Promise<FlashCard> => {
      try {
        const { data } = await reviewFlashCardMutation({
          variables: { input: { id, isCorrect } },
        });
        return data!.reviewFlashCard;
      } catch (err) {
        setError(err as ApolloError);
        throw err;
      }
    },
    [reviewFlashCardMutation]
  );

  const deleteFlashCard = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { data } = await deleteFlashCardMutation({
          variables: { id },
        });
        return data!.removeFlashCard;
      } catch (err) {
        setError(err as ApolloError);
        throw err;
      }
    },
    [deleteFlashCardMutation]
  );

  return {
    flashCards: data?.flashCards || [],
    groupStats: statsData?.groupStats || null,
    loading: loading || statsLoading,
    error,
    refetch,
    createFlashCard,
    updateFlashCard,
    reviewFlashCard,
    deleteFlashCard,
  };
};
