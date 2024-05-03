import { StackScreenProps } from "../../../types";

export type TimelineRootStack = {
  Timeline: undefined;
  TimelineDetails: { timelineId: string };
  TimelineCreate: {
    selectedDate: string;
    mode: "create" | "edit";
    timelineId?: string;
  };
  ImagesPreview: { selectedImage: string; timelineId: string };
  Schedule: { selected: string };
};

export type TimelineScreenProps<Key extends keyof TimelineRootStack> =
  StackScreenProps<TimelineRootStack, Key>;
