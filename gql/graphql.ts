/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export type AiGeneratedFlashCards = {
  __typename?: 'AIGeneratedFlashCards';
  answer: Scalars['String']['output'];
  explanation: Scalars['String']['output'];
  question: Scalars['String']['output'];
};

export type AddExpenseLocationInput = {
  expenseId: Scalars['ID']['input'];
  locationId: Scalars['ID']['input'];
};

export type AddMultipleSubExpensesInput = {
  expenseId: Scalars['ID']['input'];
  inputs: Array<CreateSubExpenseDto>;
};

export type AddTodoFileInput = {
  todoId: Scalars['ID']['input'];
  type: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

export type AiChatInput = {
  endDate?: InputMaybe<Scalars['String']['input']>;
  history?: InputMaybe<Array<ChatMessageInput>>;
  message: Scalars['String']['input'];
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type AiChatMessageItem = {
  __typename?: 'AiChatMessageItem';
  data?: Maybe<Scalars['String']['output']>;
  subtype?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type AiChatResponse = {
  __typename?: 'AiChatResponse';
  messages: Array<AiChatMessageItem>;
};

export type AmountRange = {
  from?: InputMaybe<Scalars['Float']['input']>;
  to?: InputMaybe<Scalars['Float']['input']>;
};

export type AssignExpenseToSubscriptionInput = {
  expenseId: Scalars['ID']['input'];
  subscriptionId?: InputMaybe<Scalars['ID']['input']>;
};

export type BalanceProjection = {
  __typename?: 'BalanceProjection';
  avgMonthlyExpense: Scalars['Float']['output'];
  avgMonthlyIncome: Scalars['Float']['output'];
  avgMonthlyNet: Scalars['Float']['output'];
  month: Scalars['Int']['output'];
  monthsAhead: Scalars['Int']['output'];
  projectedBalance: Scalars['Float']['output'];
  year: Scalars['Int']['output'];
};

export type CategoryLimitResult = {
  __typename?: 'CategoryLimitResult';
  category: Scalars['String']['output'];
  exceeded: Scalars['Boolean']['output'];
  limit: Scalars['Float']['output'];
  spent: Scalars['Float']['output'];
};

export type ChatMessageInput = {
  content: Scalars['String']['input'];
  role: Scalars['String']['input'];
};

export type CompleteOccurrenceInput = {
  id: Scalars['ID']['input'];
  isCompleted: Scalars['Boolean']['input'];
};

export type CompleteOccurrenceTodoInput = {
  id: Scalars['ID']['input'];
  isCompleted: Scalars['Boolean']['input'];
  occurrenceId?: InputMaybe<Scalars['ID']['input']>;
};

export type CopyOccurrenceArgsInput = {
  input?: InputMaybe<CopyOccurrenceInput>;
  occurrenceId: Scalars['ID']['input'];
};

export type CopyOccurrenceInput = {
  newDate?: InputMaybe<Scalars['String']['input']>;
};

export type CorrectionPreviewType = {
  __typename?: 'CorrectionPreviewType';
  appliedRuleId?: Maybe<Scalars['ID']['output']>;
  category?: Maybe<Scalars['String']['output']>;
  corrected: Scalars['Boolean']['output'];
  description?: Maybe<Scalars['String']['output']>;
  shop?: Maybe<Scalars['String']['output']>;
};

export type CreateAccountInput = {
  age?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
};

export type CreateAccountOutput = {
  __typename?: 'CreateAccountOutput';
  email: Scalars['String']['output'];
  error: Scalars['String']['output'];
  id: Scalars['String']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  token: Scalars['String']['output'];
};

export type CreateCorrectionMapDto = {
  matchAmountMax?: InputMaybe<Scalars['Float']['input']>;
  matchAmountMin?: InputMaybe<Scalars['Float']['input']>;
  matchCategory?: InputMaybe<Scalars['String']['input']>;
  matchDescription?: InputMaybe<Scalars['String']['input']>;
  matchShop?: InputMaybe<Scalars['String']['input']>;
  overrideCategory?: InputMaybe<Scalars['String']['input']>;
  overrideDescription?: InputMaybe<Scalars['String']['input']>;
  overrideShop?: InputMaybe<Scalars['String']['input']>;
};

export type CreateEventInput = {
  beginTime: Scalars['String']['input'];
  date?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  endTime: Scalars['String']['input'];
  priority?: InputMaybe<Scalars['Int']['input']>;
  tags: Scalars['String']['input'];
  title: Scalars['String']['input'];
  todos?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type CreateEventWithRepeatInput = {
  input: CreateEventInput;
  repeat?: InputMaybe<RepeatInput>;
};

export type CreateExercise = {
  description: Scalars['String']['input'];
  difficulty: Scalars['String']['input'];
  equipment: Scalars['String']['input'];
  muscleGroup: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateExpenseInput = {
  amount: Scalars['Float']['input'];
  category: Scalars['String']['input'];
  date: Scalars['String']['input'];
  description: Scalars['String']['input'];
  isSubscription?: InputMaybe<Scalars['Boolean']['input']>;
  schedule?: InputMaybe<Scalars['Boolean']['input']>;
  shop?: InputMaybe<Scalars['String']['input']>;
  spontaneousRate?: InputMaybe<Scalars['Float']['input']>;
  subAccountId?: InputMaybe<Scalars['ID']['input']>;
  type: Scalars['String']['input'];
};

export type CreateFlashCardInput = {
  answer: Scalars['String']['input'];
  explanation?: InputMaybe<Scalars['String']['input']>;
  groupId: Scalars['ID']['input'];
  question: Scalars['String']['input'];
};

export type CreateGoalsInput = {
  description: Scalars['String']['input'];
  icon: Scalars['String']['input'];
  max: Scalars['Float']['input'];
  min: Scalars['Float']['input'];
  name: Scalars['String']['input'];
  target: Scalars['Float']['input'];
  unit: Scalars['String']['input'];
};

export type CreateGroupInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateLimit = {
  amount: Scalars['Float']['input'];
  category: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type CreateLocationDto = {
  kind: Scalars['String']['input'];
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
  name: Scalars['String']['input'];
};

export type CreateOccurrenceTodoInput = {
  occurrenceId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
};

export type CreateProgressInput = {
  exerciseId: Scalars['ID']['input'];
  reps: Scalars['Int']['input'];
  sets: Scalars['Int']['input'];
  weight: Scalars['Float']['input'];
};

export type CreateShortcutExpenseInput = {
  amount: Scalars['Float']['input'];
  description: Scalars['String']['input'];
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateSubAccountInput = {
  balance?: InputMaybe<Scalars['Float']['input']>;
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateSubExpenseArgsInput = {
  expenseId: Scalars['ID']['input'];
  input: CreateSubExpenseDto;
};

export type CreateSubExpenseDto = {
  amount: Scalars['Float']['input'];
  category: Scalars['String']['input'];
  description: Scalars['String']['input'];
};

export type CreateSubscriptionInput = {
  amount: Scalars['Float']['input'];
  billingCycle: Scalars['String']['input'];
  billingDay?: InputMaybe<Scalars['Int']['input']>;
  customBillingMonths?: InputMaybe<Array<Scalars['Int']['input']>>;
  dateEnd?: InputMaybe<Scalars['String']['input']>;
  dateStart: Scalars['String']['input'];
  description: Scalars['String']['input'];
  nextBillingDate: Scalars['String']['input'];
  reminderDaysBeforehand?: InputMaybe<Scalars['Int']['input']>;
  subAccountId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateWorkout = {
  description: Scalars['String']['input'];
  difficulty: Scalars['String']['input'];
  exercises?: InputMaybe<Array<Scalars['ID']['input']>>;
  title: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type DateRangeInput = {
  end: Scalars['DateTime']['input'];
  start: Scalars['DateTime']['input'];
};

export type DeleteOccurrenceInput = {
  id: Scalars['ID']['input'];
  scope?: Scalars['String']['input'];
};

export type EditExpenseInput = {
  amount: Scalars['Float']['input'];
  category: Scalars['String']['input'];
  date: Scalars['String']['input'];
  description: Scalars['String']['input'];
  expenseId: Scalars['ID']['input'];
  spontaneousRate?: InputMaybe<Scalars['Float']['input']>;
  subAccountId?: InputMaybe<Scalars['ID']['input']>;
  type: Scalars['String']['input'];
};

export type EditExpenseNoteInput = {
  expenseId: Scalars['ID']['input'];
  note: Scalars['String']['input'];
};

export type EditOccurrenceArgsInput = {
  id: Scalars['ID']['input'];
  input: EditOccurrenceInput;
  scope?: Scalars['String']['input'];
};

export type EditOccurrenceInput = {
  beginTime?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endTime?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  tags?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type EditWalletBalanceInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  paycheck?: InputMaybe<Scalars['Float']['input']>;
  paycheckDate?: InputMaybe<Scalars['String']['input']>;
};

export type EventOccurrenceEntity = {
  __typename?: 'EventOccurrenceEntity';
  beginTimeOverride?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  descriptionOverride?: Maybe<Scalars['String']['output']>;
  endTimeOverride?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isCompleted: Scalars['Boolean']['output'];
  isException: Scalars['Boolean']['output'];
  isRepeat?: Maybe<Scalars['Boolean']['output']>;
  isSkipped: Scalars['Boolean']['output'];
  position: Scalars['Int']['output'];
  repeatCount?: Maybe<Scalars['Int']['output']>;
  repeatEveryNth?: Maybe<Scalars['Int']['output']>;
  repeatFrequency?: Maybe<Scalars['String']['output']>;
  titleOverride?: Maybe<Scalars['String']['output']>;
  todos: Array<OccurrenceTodoEntity>;
};

export type ExerciseEntity = {
  __typename?: 'ExerciseEntity';
  description: Scalars['String']['output'];
  difficulty: Scalars['String']['output'];
  equipment: Scalars['String']['output'];
  exerciseId: Scalars['ID']['output'];
  exerciseProgress: Array<ExerciseProgressEntity>;
  image?: Maybe<Scalars['String']['output']>;
  muscleGroup: Scalars['String']['output'];
  tips: Array<TipsEntity>;
  title: Scalars['String']['output'];
};

export type ExerciseProgressEntity = {
  __typename?: 'ExerciseProgressEntity';
  date: Scalars['String']['output'];
  exerciseProgressId: Scalars['ID']['output'];
  reps: Scalars['Int']['output'];
  sets: Scalars['Int']['output'];
  weight: Scalars['Float']['output'];
};

export type ExpenseCorrectionMapEntity = {
  __typename?: 'ExpenseCorrectionMapEntity';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  matchAmountMax?: Maybe<Scalars['Float']['output']>;
  matchAmountMin?: Maybe<Scalars['Float']['output']>;
  matchCategory?: Maybe<Scalars['String']['output']>;
  matchDescription?: Maybe<Scalars['String']['output']>;
  matchShop?: Maybe<Scalars['String']['output']>;
  overrideCategory?: Maybe<Scalars['String']['output']>;
  overrideDescription?: Maybe<Scalars['String']['output']>;
  overrideShop?: Maybe<Scalars['String']['output']>;
};

export type ExpenseEntity = {
  __typename?: 'ExpenseEntity';
  amount: Scalars['Float']['output'];
  balanceBeforeInteraction?: Maybe<Scalars['Int']['output']>;
  category?: Maybe<Scalars['String']['output']>;
  date: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  files: Array<ExpenseFileEntity>;
  id: Scalars['ID']['output'];
  location?: Maybe<ExpenseLocationEntity>;
  note?: Maybe<Scalars['String']['output']>;
  schedule: Scalars['Boolean']['output'];
  shop?: Maybe<Scalars['String']['output']>;
  spontaneousRate?: Maybe<Scalars['Float']['output']>;
  subAccount?: Maybe<WalletSubAccount>;
  subAccountId?: Maybe<Scalars['String']['output']>;
  subexpenses: Array<ExpenseSubExpense>;
  subscription?: Maybe<SubscriptionEntity>;
  subscriptionId?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  walletId: Scalars['String']['output'];
};

export type ExpenseFileEntity = {
  __typename?: 'ExpenseFileEntity';
  id: Scalars['ID']['output'];
  url: Scalars['String']['output'];
};

export type ExpenseLocationEntity = {
  __typename?: 'ExpenseLocationEntity';
  expenses: Array<ExpenseEntity>;
  id: Scalars['ID']['output'];
  kind: Scalars['String']['output'];
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  name: Scalars['String']['output'];
};

export type ExpensePredictionType = {
  __typename?: 'ExpensePredictionType';
  amount: Scalars['Float']['output'];
  category: Scalars['String']['output'];
  confidence: Scalars['Float']['output'];
  description: Scalars['String']['output'];
  locationId?: Maybe<Scalars['String']['output']>;
  shop?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type ExpenseSubExpense = {
  __typename?: 'ExpenseSubExpense';
  amount: Scalars['Float']['output'];
  category: Scalars['String']['output'];
  description: Scalars['String']['output'];
  expenseId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
};

export type ExtractTasksResponse = {
  __typename?: 'ExtractTasksResponse';
  message: Scalars['String']['output'];
  tasks: Array<EventOccurrenceEntity>;
};

export type FlashCard = {
  __typename?: 'FlashCard';
  answer: Scalars['String']['output'];
  correctAnswers: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  difficultyLevel: Scalars['Int']['output'];
  explanation?: Maybe<Scalars['String']['output']>;
  group: Group;
  id: Scalars['ID']['output'];
  incorrectAnswers: Scalars['Int']['output'];
  lastReviewedAt?: Maybe<Scalars['DateTime']['output']>;
  question: Scalars['String']['output'];
  successRate: Scalars['Float']['output'];
  timesReviewed: Scalars['Int']['output'];
};

export type GetWalletFilters = {
  accountId?: InputMaybe<Scalars['String']['input']>;
  amount?: InputMaybe<AmountRange>;
  category?: InputMaybe<Array<Scalars['String']['input']>>;
  date?: InputMaybe<RangeDate>;
  isExactCategory?: InputMaybe<Scalars['Boolean']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

/** Goal */
export type Goal = {
  __typename?: 'Goal';
  categories: Array<GoalCategory>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  userId: Scalars['String']['output'];
};

export type GoalCategory = {
  __typename?: 'GoalCategory';
  description: Scalars['String']['output'];
  entries: Array<GoalEntry>;
  icon: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  max: Scalars['Int']['output'];
  min: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  target: Scalars['Int']['output'];
  unit?: Maybe<Scalars['String']['output']>;
  userGoal: UserGoal;
  userGoalId: Scalars['String']['output'];
};

export type GoalEntry = {
  __typename?: 'GoalEntry';
  category: GoalCategory;
  categoryId: Scalars['String']['output'];
  date: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  value: Scalars['Float']['output'];
};

/** GoalStats */
export type GoalStats = {
  __typename?: 'GoalStats';
  category: GoalCategory;
  categoryId: Scalars['String']['output'];
  date: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  value: Scalars['Float']['output'];
};

/** Goals */
export type Goals = {
  __typename?: 'Goals';
  description: Scalars['String']['output'];
  entries: Array<GoalEntry>;
  icon: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  max: Scalars['Int']['output'];
  min: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  target: Scalars['Int']['output'];
  unit?: Maybe<Scalars['String']['output']>;
  userGoal: UserGoal;
  userGoalId: Scalars['String']['output'];
};

export type Group = {
  __typename?: 'Group';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  flashcards: Array<FlashCard>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type GroupStats = {
  __typename?: 'GroupStats';
  averageSuccessRate: Scalars['Float']['output'];
  masteredCards: Scalars['Int']['output'];
  totalCards: Scalars['Int']['output'];
  totalReviewed: Scalars['Int']['output'];
};

export type HourlyStats = {
  __typename?: 'HourlyStats';
  avg_amount: Scalars['Float']['output'];
  count: Scalars['Float']['output'];
  hour: Scalars['Float']['output'];
  max_amount: Scalars['Float']['output'];
  min_amount: Scalars['Float']['output'];
  std_deviation: Scalars['Float']['output'];
  variance: Scalars['Float']['output'];
};

export type LimitsOutput = {
  __typename?: 'LimitsOutput';
  amount: Scalars['Float']['output'];
  category: Scalars['String']['output'];
  current: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  isAutoGenerated: Scalars['Boolean']['output'];
  type: Scalars['String']['output'];
};

export type LoginAccountInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['Int']['input']>;
};

export type MonthDay = {
  __typename?: 'MonthDay';
  date: Scalars['String']['output'];
};

export type MonthlyCategoryComparisonItem = {
  __typename?: 'MonthlyCategoryComparisonItem';
  avg: Scalars['Float']['output'];
  category: Scalars['String']['output'];
  count: Scalars['Float']['output'];
  total: Scalars['Float']['output'];
};

export type MonthlyCategoryComparisonOutput = {
  __typename?: 'MonthlyCategoryComparisonOutput';
  categories?: Maybe<Array<MonthlyCategoryComparisonItem>>;
  month?: Maybe<Scalars['String']['output']>;
};

export type MonthlyExpenses = {
  __typename?: 'MonthlyExpenses';
  expenses: Array<ExpenseEntity>;
  flow: MonthlyFlow;
  month: Scalars['String']['output'];
};

export type MonthlyFlow = {
  __typename?: 'MonthlyFlow';
  expense: Scalars['Float']['output'];
  income: Scalars['Float']['output'];
};

export type MonthlyHeatMap = {
  __typename?: 'MonthlyHeatMap';
  averageAmount: Scalars['Float']['output'];
  dayOfMonth: Scalars['Int']['output'];
  totalAmount: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type MonthlyLimitResult = {
  __typename?: 'MonthlyLimitResult';
  categories: Array<CategoryLimitResult>;
  generalLimit: Scalars['Float']['output'];
  generalLimitExceeded: Scalars['Boolean']['output'];
  month: Scalars['String']['output'];
  totalSpent: Scalars['Float']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addExpenseLocation: Scalars['Boolean']['output'];
  addMultipleSubExpenses: Array<ExpenseSubExpense>;
  addTodoFile: TodoFilesEntity;
  aiChat: AiChatResponse;
  assignExerciseToWorkout: Scalars['Boolean']['output'];
  assignExpenseToSubscription: ExpenseEntity;
  cancelSubscription: ExpenseEntity;
  completeOccurrence: OccurrenceView;
  completeOccurrenceTodo: OccurrenceTodoEntity;
  copyOccurrence: OccurrenceView;
  create: SubscriptionEntity;
  createAccount: CreateAccountOutput;
  createCorrectionMap: ExpenseCorrectionMapEntity;
  createEvent: OccurrenceView;
  createExercise: ExerciseEntity;
  createExerciseProgress: ExerciseProgressEntity;
  createExpense: ExpenseEntity;
  createExpenseFromImage: ExpenseEntity;
  createFlashCard: FlashCard;
  createGoals: Goals;
  createGroup: Group;
  createLimit: WalletLimits;
  createLocation: ExpenseLocationEntity;
  createOccurrenceTodo: OccurrenceTodoEntity;
  createShortcutExpense: ExpenseEntity;
  createSubAccount: WalletSubAccount;
  createSubExpense: ExpenseSubExpense;
  createSubscription: ExpenseEntity;
  createWallet: Scalars['Boolean']['output'];
  createWorkout: WorkoutEntity;
  deleteCorrectionMap: Scalars['Boolean']['output'];
  deleteExpense: Scalars['ID']['output'];
  deleteGoals: SuccessfulRemoval;
  deleteLimit: Scalars['Boolean']['output'];
  deleteOccurrence: Scalars['Boolean']['output'];
  deleteSubAccount: Scalars['Boolean']['output'];
  deleteSubExpense: Scalars['Boolean']['output'];
  editExpense: ExpenseEntity;
  editExpenseNote: Scalars['Boolean']['output'];
  editOccurrence: OccurrenceView;
  editWalletBalance: WalletEntity;
  loginAccount: CreateAccountOutput;
  modifySubscription: SubscriptionEntity;
  readAllNotifications: Scalars['Boolean']['output'];
  readNotification: Scalars['Boolean']['output'];
  refreshToken: Scalars['String']['output'];
  refundExpense: ExpenseEntity;
  removeFlashCard: SuccessfulRemoval;
  removeGroup: Scalars['Boolean']['output'];
  removeOccurrenceTodo: Scalars['Boolean']['output'];
  removeTodoFile: Scalars['Boolean']['output'];
  removeflashCardGroup: SuccessfulRemoval;
  renewSubscription: ExpenseEntity;
  reviewFlashCard: FlashCard;
  setLiveActivityUpdateToken: Scalars['Boolean']['output'];
  setNotificationsToken: Scalars['Boolean']['output'];
  setPushToStartToken: Scalars['Boolean']['output'];
  timelineExtractTasks: ExtractTasksResponse;
  toggleEnabledNotifications: NotificationsEntity;
  transferBetweenSubAccounts: TransferResult;
  transferTodos: Scalars['Boolean']['output'];
  unreadNotifications: Array<NotificationsHistoryEntity>;
  updateCorrectionMap: ExpenseCorrectionMapEntity;
  updateFlashCard: FlashCard;
  updateGoals: Goals;
  updateGroup: Group;
  updateSubAccount: WalletSubAccount;
  updateSubExpense: ExpenseSubExpense;
  upsertGoalStats: GoalStats;
};


export type MutationAddExpenseLocationArgs = {
  input: AddExpenseLocationInput;
};


export type MutationAddMultipleSubExpensesArgs = {
  input: AddMultipleSubExpensesInput;
};


export type MutationAddTodoFileArgs = {
  input: AddTodoFileInput;
};


export type MutationAiChatArgs = {
  input: AiChatInput;
};


export type MutationAssignExerciseToWorkoutArgs = {
  exerciseId: Scalars['String']['input'];
  workoutId: Scalars['String']['input'];
};


export type MutationAssignExpenseToSubscriptionArgs = {
  input: AssignExpenseToSubscriptionInput;
};


export type MutationCancelSubscriptionArgs = {
  subscriptionId: Scalars['ID']['input'];
};


export type MutationCompleteOccurrenceArgs = {
  input: CompleteOccurrenceInput;
};


export type MutationCompleteOccurrenceTodoArgs = {
  input: CompleteOccurrenceTodoInput;
};


export type MutationCopyOccurrenceArgs = {
  input: CopyOccurrenceArgsInput;
};


export type MutationCreateArgs = {
  input: CreateSubscriptionInput;
};


export type MutationCreateAccountArgs = {
  account: CreateAccountInput;
};


export type MutationCreateCorrectionMapArgs = {
  input: CreateCorrectionMapDto;
};


export type MutationCreateEventArgs = {
  input: CreateEventWithRepeatInput;
};


export type MutationCreateExerciseArgs = {
  input: CreateExercise;
};


export type MutationCreateExerciseProgressArgs = {
  input: CreateProgressInput;
};


export type MutationCreateExpenseArgs = {
  input: CreateExpenseInput;
};


export type MutationCreateExpenseFromImageArgs = {
  image: Scalars['String']['input'];
};


export type MutationCreateFlashCardArgs = {
  input: CreateFlashCardInput;
};


export type MutationCreateGoalsArgs = {
  input: CreateGoalsInput;
};


export type MutationCreateGroupArgs = {
  input: CreateGroupInput;
};


export type MutationCreateLimitArgs = {
  input: CreateLimit;
};


export type MutationCreateLocationArgs = {
  input: CreateLocationDto;
};


export type MutationCreateOccurrenceTodoArgs = {
  input: CreateOccurrenceTodoInput;
};


export type MutationCreateShortcutExpenseArgs = {
  input: CreateShortcutExpenseInput;
};


export type MutationCreateSubAccountArgs = {
  input: CreateSubAccountInput;
};


export type MutationCreateSubExpenseArgs = {
  input: CreateSubExpenseArgsInput;
};


export type MutationCreateSubscriptionArgs = {
  expenseId: Scalars['ID']['input'];
};


export type MutationCreateWalletArgs = {
  balance?: Scalars['Float']['input'];
};


export type MutationCreateWorkoutArgs = {
  input: CreateWorkout;
};


export type MutationDeleteCorrectionMapArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteExpenseArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteGoalsArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteLimitArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteOccurrenceArgs = {
  input: DeleteOccurrenceInput;
};


export type MutationDeleteSubAccountArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSubExpenseArgs = {
  id: Scalars['ID']['input'];
};


export type MutationEditExpenseArgs = {
  input: EditExpenseInput;
};


export type MutationEditExpenseNoteArgs = {
  input: EditExpenseNoteInput;
};


export type MutationEditOccurrenceArgs = {
  input: EditOccurrenceArgsInput;
};


export type MutationEditWalletBalanceArgs = {
  input: EditWalletBalanceInput;
};


export type MutationLoginAccountArgs = {
  account: LoginAccountInput;
};


export type MutationModifySubscriptionArgs = {
  input: UpdateSubscriptionInput;
};


export type MutationReadNotificationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRefundExpenseArgs = {
  expenseId: Scalars['ID']['input'];
};


export type MutationRemoveFlashCardArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveGroupArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveOccurrenceTodoArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveTodoFileArgs = {
  fileId: Scalars['ID']['input'];
};


export type MutationRemoveflashCardGroupArgs = {
  groupId: Scalars['String']['input'];
};


export type MutationRenewSubscriptionArgs = {
  subscriptionId: Scalars['ID']['input'];
};


export type MutationReviewFlashCardArgs = {
  input: ReviewFlashCardInput;
};


export type MutationSetLiveActivityUpdateTokenArgs = {
  input: SetUpdateTokenInput;
};


export type MutationSetNotificationsTokenArgs = {
  input: SetNotificationsTokenInput;
};


export type MutationSetPushToStartTokenArgs = {
  input: SetPushToStartTokenInput;
};


export type MutationTimelineExtractTasksArgs = {
  content: Scalars['String']['input'];
  currentDate?: InputMaybe<Scalars['String']['input']>;
  history?: InputMaybe<Array<TaskHistory>>;
};


export type MutationToggleEnabledNotificationsArgs = {
  input: Scalars['JSON']['input'];
};


export type MutationTransferBetweenSubAccountsArgs = {
  input: TransferBetweenSubAccountsInput;
};


export type MutationTransferTodosArgs = {
  input: TransferTodosInput;
};


export type MutationUpdateCorrectionMapArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCorrectionMapDto;
};


export type MutationUpdateFlashCardArgs = {
  input: UpdateFlashCardInput;
};


export type MutationUpdateGoalsArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGoalsInput;
};


export type MutationUpdateGroupArgs = {
  input: UpdateGroupInput;
};


export type MutationUpdateSubAccountArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSubAccountInput;
};


export type MutationUpdateSubExpenseArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSubExpenseDto;
};


export type MutationUpsertGoalStatsArgs = {
  input: UpsertGoalStatsInput;
};

export type NotificationTypeDto = {
  __typename?: 'NotificationTypeDto';
  category: Scalars['String']['output'];
  description: Scalars['String']['output'];
  key: Scalars['String']['output'];
  schedule?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type NotificationsEntity = {
  __typename?: 'NotificationsEntity';
  enabledNotifications: Scalars['JSON']['output'];
  id: Scalars['ID']['output'];
  isEnable: Scalars['Boolean']['output'];
  liveActivityToken: Scalars['String']['output'];
  token: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type NotificationsHistoryEntity = {
  __typename?: 'NotificationsHistoryEntity';
  id: Scalars['ID']['output'];
  message: Scalars['JSON']['output'];
  read: Scalars['Boolean']['output'];
  sendAt: Scalars['DateTime']['output'];
  type: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type OccurrenceFileView = {
  __typename?: 'OccurrenceFileView';
  id: Scalars['ID']['output'];
  isPublic: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type OccurrenceFiltersInput = {
  eventIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  isCompleted?: InputMaybe<Scalars['Boolean']['input']>;
};

export type OccurrenceTodoEntity = {
  __typename?: 'OccurrenceTodoEntity';
  createdAt: Scalars['DateTime']['output'];
  files: Array<TodoFilesEntity>;
  id: Scalars['ID']['output'];
  isCompleted: Scalars['Boolean']['output'];
  modifiedAt: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
};

export type OccurrenceTodoView = {
  __typename?: 'OccurrenceTodoView';
  createdAt: Scalars['DateTime']['output'];
  files: Array<TodoFilesEntity>;
  id: Scalars['ID']['output'];
  isCompleted: Scalars['Boolean']['output'];
  modifiedAt: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
};

export type OccurrenceView = {
  __typename?: 'OccurrenceView';
  beginTime?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  endTime?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  images: Array<OccurrenceFileView>;
  isAllDay: Scalars['Boolean']['output'];
  isCompleted: Scalars['Boolean']['output'];
  isRepeat: Scalars['Boolean']['output'];
  isSkipped: Scalars['Boolean']['output'];
  position: Scalars['Int']['output'];
  priority: Scalars['Int']['output'];
  reminderBeforeMinutes?: Maybe<Scalars['Int']['output']>;
  seriesId: Scalars['ID']['output'];
  tags: Scalars['String']['output'];
  title: Scalars['String']['output'];
  todos: Array<OccurrenceTodoView>;
};

export type PaginationInput = {
  skip: Scalars['Int']['input'];
  take: Scalars['Int']['input'];
};

export type Query = {
  __typename?: 'Query';
  aiChatHistory: Array<AiChatResponse>;
  correctionMap?: Maybe<ExpenseCorrectionMapEntity>;
  correctionMaps: Array<ExpenseCorrectionMapEntity>;
  exerciseProgress: Array<ExerciseProgressEntity>;
  exerciseProgressStats: Scalars['Boolean']['output'];
  exercises: Array<ExerciseEntity>;
  expense: ExpenseEntity;
  expenseSimilar: Array<ExpenseEntity>;
  flashCard: FlashCard;
  flashCardStats: FlashCard;
  flashCards: Array<FlashCard>;
  generateAIFlashcards: Array<AiGeneratedFlashCards>;
  getAvailableNotificationTypes: Array<NotificationTypeDto>;
  getMonthTotal: Scalars['Float']['output'];
  getNotificationSettings: NotificationsEntity;
  getPossibleSubscription: SubscriptionEntity;
  getStatistics: WalletStatisticsRange;
  goal: Goals;
  goals: Array<Goals>;
  group: Group;
  groupStats: GroupStats;
  groups: Array<Group>;
  hello: Scalars['String']['output'];
  hourlySpendingsHeatMap: Array<HourlyStats>;
  limits: Array<LimitsOutput>;
  locations: Array<ExpenseLocationEntity>;
  monthlyCategoryComparison: Array<MonthlyCategoryComparisonOutput>;
  monthlyDateSpendings: Array<MonthlyHeatMap>;
  notifications: Array<NotificationsHistoryEntity>;
  occurrenceById: OccurrenceView;
  occurrenceMonth: Array<MonthDay>;
  occurrenceTodo: OccurrenceTodoEntity;
  occurrences: Array<OccurrenceView>;
  occurrencesByCurrentDate: Array<OccurrenceView>;
  predictExpense?: Maybe<ExpensePredictionType>;
  previewCorrection: CorrectionPreviewType;
  statisticsDailySpendings: Array<StatisticsDailySpendings>;
  statisticsDayOfWeek: Array<StatisticsDayOfWeekComparison>;
  statisticsLegend: Array<StatisticsLegend>;
  statisticsSpendingsLimits: Array<MonthlyLimitResult>;
  statisticsZeroExpenseDays: ZeroExpenseDays;
  subExpense?: Maybe<ExpenseSubExpense>;
  subExpenses: Array<ExpenseSubExpense>;
  subscription: SubscriptionEntity;
  subscriptions: Array<SubscriptionEntity>;
  userGoal: Goal;
  wallet: WalletEntity;
  walletBalancePrediction: WalletBalancePrediction;
  workout: WorkoutEntity;
  workouts: Array<WorkoutEntity>;
};


export type QueryCorrectionMapArgs = {
  id: Scalars['ID']['input'];
};


export type QueryExerciseProgressArgs = {
  exerciseId: Scalars['ID']['input'];
};


export type QueryExerciseProgressStatsArgs = {
  exerciseId: Scalars['ID']['input'];
};


export type QueryExpenseArgs = {
  expenseId: Scalars['ID']['input'];
};


export type QueryExpenseSimilarArgs = {
  expenseId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryFlashCardArgs = {
  id: Scalars['ID']['input'];
};


export type QueryFlashCardStatsArgs = {
  id: Scalars['ID']['input'];
};


export type QueryFlashCardsArgs = {
  groupId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryGenerateAiFlashcardsArgs = {
  content: Scalars['String']['input'];
  groupId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryGetMonthTotalArgs = {
  date: Scalars['String']['input'];
};


export type QueryGetPossibleSubscriptionArgs = {
  expenseId: Scalars['ID']['input'];
};


export type QueryGetStatisticsArgs = {
  range: Array<Scalars['String']['input']>;
};


export type QueryGoalArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGroupArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGroupStatsArgs = {
  groupId: Scalars['ID']['input'];
};


export type QueryHourlySpendingsHeatMapArgs = {
  months: Array<Scalars['String']['input']>;
};


export type QueryLimitsArgs = {
  date?: InputMaybe<Scalars['String']['input']>;
  range: Scalars['String']['input'];
};


export type QueryLocationsArgs = {
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMonthlyCategoryComparisonArgs = {
  months: Array<Scalars['String']['input']>;
};


export type QueryMonthlyDateSpendingsArgs = {
  months: Array<Scalars['String']['input']>;
};


export type QueryNotificationsArgs = {
  skip: Scalars['Int']['input'];
  take: Scalars['Int']['input'];
};


export type QueryOccurrenceByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryOccurrenceMonthArgs = {
  date: Scalars['String']['input'];
};


export type QueryOccurrenceTodoArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOccurrencesArgs = {
  date?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<OccurrenceFiltersInput>;
  pagination?: InputMaybe<PaginationInput>;
  query?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPredictExpenseArgs = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  input: Scalars['String']['input'];
};


export type QueryPreviewCorrectionArgs = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  shop?: InputMaybe<Scalars['String']['input']>;
};


export type QueryStatisticsDailySpendingsArgs = {
  endDate: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};


export type QueryStatisticsDayOfWeekArgs = {
  endDate: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};


export type QueryStatisticsLegendArgs = {
  displayMode: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};


export type QueryStatisticsSpendingsLimitsArgs = {
  endDate: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};


export type QueryStatisticsZeroExpenseDaysArgs = {
  endDate: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};


export type QuerySubExpenseArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySubExpensesArgs = {
  expenseId: Scalars['ID']['input'];
};


export type QuerySubscriptionArgs = {
  id: Scalars['String']['input'];
};


export type QueryUserGoalArgs = {
  dateRange?: InputMaybe<DateRangeInput>;
};


export type QueryWalletBalancePredictionArgs = {
  toDate: Scalars['String']['input'];
};


export type QueryWorkoutArgs = {
  id: Scalars['ID']['input'];
};

export type RangeDate = {
  from?: InputMaybe<Scalars['String']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
};

export type RepeatInput = {
  reminderBeforeMinutes?: InputMaybe<Scalars['Int']['input']>;
  repeatCount?: InputMaybe<Scalars['Int']['input']>;
  repeatDaysOfWeek?: InputMaybe<Array<Scalars['Int']['input']>>;
  repeatEveryNth?: InputMaybe<Scalars['Int']['input']>;
  repeatInterval?: InputMaybe<Scalars['Int']['input']>;
  repeatOn?: InputMaybe<Scalars['String']['input']>;
  repeatType?: InputMaybe<Scalars['String']['input']>;
  repeatUntil?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type ReviewFlashCardInput = {
  id: Scalars['ID']['input'];
  isCorrect: Scalars['Boolean']['input'];
};

export type SetNotificationsTokenInput = {
  token: Scalars['String']['input'];
};

export type SetPushToStartTokenInput = {
  pushToStartToken: Scalars['String']['input'];
};

export type SetUpdateTokenInput = {
  activityId: Scalars['ID']['input'];
  occurrenceId?: InputMaybe<Scalars['String']['input']>;
  updateToken: Scalars['String']['input'];
};

export type StatisticsDailySpendings = {
  __typename?: 'StatisticsDailySpendings';
  date: Scalars['String']['output'];
  day: Scalars['String']['output'];
  total: Scalars['Float']['output'];
};

export type StatisticsDayOfWeekComparison = {
  __typename?: 'StatisticsDayOfWeekComparison';
  avg: Scalars['Float']['output'];
  count: Scalars['Float']['output'];
  day: Scalars['Float']['output'];
  median: Scalars['Float']['output'];
  total: Scalars['Float']['output'];
};

export type StatisticsLegend = {
  __typename?: 'StatisticsLegend';
  category: Scalars['String']['output'];
  count: Scalars['String']['output'];
  percentage: Scalars['Float']['output'];
  total: Scalars['Float']['output'];
};

export type SubscriptionEntity = {
  __typename?: 'SubscriptionEntity';
  amount: Scalars['Float']['output'];
  billingCycle: Scalars['String']['output'];
  billingDay?: Maybe<Scalars['Int']['output']>;
  customBillingMonths?: Maybe<Array<Scalars['Int']['output']>>;
  dateEnd?: Maybe<Scalars['String']['output']>;
  dateStart: Scalars['String']['output'];
  description: Scalars['String']['output'];
  expenses: Array<ExpenseEntity>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  nextBillingDate: Scalars['String']['output'];
  reminderDaysBeforehand: Scalars['Int']['output'];
  subAccountId?: Maybe<Scalars['ID']['output']>;
  subscription?: Maybe<SubscriptionEntity>;
  totalAmount: Scalars['Float']['output'];
  totalDuration: Scalars['Float']['output'];
  totalSpent: Scalars['Float']['output'];
  walletId: Scalars['ID']['output'];
};

export type SuccessfulRemoval = {
  __typename?: 'SuccessfulRemoval';
  deletedId: Scalars['ID']['output'];
  isDeleted: Scalars['Boolean']['output'];
};

export type TaskHistory = {
  content: Scalars['String']['input'];
  role: Scalars['String']['input'];
};

export type TipsEntity = {
  __typename?: 'TipsEntity';
  image: Scalars['String']['output'];
  text: Scalars['String']['output'];
  tipId: Scalars['ID']['output'];
};

export type TodoFilesEntity = {
  __typename?: 'TodoFilesEntity';
  id: Scalars['ID']['output'];
  type: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type TransferBetweenSubAccountsInput = {
  amount: Scalars['Float']['input'];
  fromId: Scalars['ID']['input'];
  toId: Scalars['ID']['input'];
};

export type TransferResult = {
  __typename?: 'TransferResult';
  amount: Scalars['Float']['output'];
  from: Scalars['ID']['output'];
  to: Scalars['ID']['output'];
};

export type TransferTodosInput = {
  sourceOccurrenceId: Scalars['ID']['input'];
  targetOccurrenceId: Scalars['ID']['input'];
};

export type UpdateCorrectionMapDto = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  matchAmountMax?: InputMaybe<Scalars['Float']['input']>;
  matchAmountMin?: InputMaybe<Scalars['Float']['input']>;
  matchCategory?: InputMaybe<Scalars['String']['input']>;
  matchDescription?: InputMaybe<Scalars['String']['input']>;
  matchShop?: InputMaybe<Scalars['String']['input']>;
  overrideCategory?: InputMaybe<Scalars['String']['input']>;
  overrideDescription?: InputMaybe<Scalars['String']['input']>;
  overrideShop?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateFlashCardInput = {
  answer?: InputMaybe<Scalars['String']['input']>;
  difficultyLevel?: InputMaybe<Scalars['Int']['input']>;
  explanation?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  question?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateGoalsInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  max: Scalars['Float']['input'];
  min: Scalars['Float']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  target: Scalars['Float']['input'];
};

export type UpdateGroupInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSubAccountInput = {
  balance?: InputMaybe<Scalars['Float']['input']>;
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSubExpenseDto = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSubscriptionInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  billingCycle?: InputMaybe<Scalars['String']['input']>;
  billingDay?: InputMaybe<Scalars['Int']['input']>;
  customBillingMonths?: InputMaybe<Array<Scalars['Int']['input']>>;
  dateEnd?: InputMaybe<Scalars['String']['input']>;
  dateStart?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  nextBillingDate?: InputMaybe<Scalars['String']['input']>;
  reminderDaysBeforehand?: InputMaybe<Scalars['Int']['input']>;
  subAccountId?: InputMaybe<Scalars['ID']['input']>;
  walletId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpsertGoalStatsInput = {
  date?: InputMaybe<Scalars['DateTime']['input']>;
  goalsId: Scalars['ID']['input'];
  value: Scalars['Float']['input'];
};

export type UserGoal = {
  __typename?: 'UserGoal';
  categories: Array<GoalCategory>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  userId: Scalars['String']['output'];
};

export type WalletBalancePrediction = {
  __typename?: 'WalletBalancePrediction';
  avgMonthlyExpense: Scalars['Float']['output'];
  avgMonthlyIncome: Scalars['Float']['output'];
  avgMonthlyNet: Scalars['Float']['output'];
  currentBalance: Scalars['Float']['output'];
  historicalMonths: Scalars['Int']['output'];
  projections: Array<BalanceProjection>;
};

export type WalletEntity = {
  __typename?: 'WalletEntity';
  balance: Scalars['Float']['output'];
  expenses: Array<ExpenseEntity>;
  expenses2: Array<MonthlyExpenses>;
  id: Scalars['ID']['output'];
  income: Scalars['Float']['output'];
  limits: Array<WalletLimits>;
  monthlyPercentageTarget: Scalars['Float']['output'];
  paycheckDate?: Maybe<Scalars['String']['output']>;
  subAccounts: Array<WalletSubAccount>;
};


export type WalletEntityExpensesArgs = {
  filters?: InputMaybe<GetWalletFilters>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


export type WalletEntityExpenses2Args = {
  filters?: InputMaybe<GetWalletFilters>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type WalletLimits = {
  __typename?: 'WalletLimits';
  amount: Scalars['Float']['output'];
  category: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isAutoGenerated: Scalars['Boolean']['output'];
  type: Scalars['String']['output'];
};

export type WalletStatisticsRange = {
  __typename?: 'WalletStatisticsRange';
  average?: Maybe<Scalars['Float']['output']>;
  count?: Maybe<Scalars['Float']['output']>;
  expense?: Maybe<Scalars['Float']['output']>;
  income?: Maybe<Scalars['Float']['output']>;
  lastBalance?: Maybe<Scalars['Float']['output']>;
  max?: Maybe<Scalars['Float']['output']>;
  min?: Maybe<Scalars['Float']['output']>;
  theLeastCommonCategory?: Maybe<Scalars['String']['output']>;
  theMostCommonCategory?: Maybe<Scalars['String']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
};

export type WalletSubAccount = {
  __typename?: 'WalletSubAccount';
  balance: Scalars['Float']['output'];
  color?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  expense?: Maybe<Scalars['Float']['output']>;
  expenses?: Maybe<Array<ExpenseEntity>>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  income?: Maybe<Scalars['Float']['output']>;
  isDefault: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export type WorkoutEntity = {
  __typename?: 'WorkoutEntity';
  description: Scalars['String']['output'];
  difficulty: Scalars['String']['output'];
  exercises: Array<ExerciseEntity>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  workoutId: Scalars['ID']['output'];
};

export type ZeroExpenseDays = {
  __typename?: 'ZeroExpenseDays';
  avg: Scalars['Float']['output'];
  days: Array<Scalars['String']['output']>;
  saved: Scalars['Float']['output'];
  streak: Array<ZeroExpenseStreak>;
};

export type ZeroExpenseStreak = {
  __typename?: 'ZeroExpenseStreak';
  end: Scalars['String']['output'];
  length: Scalars['Int']['output'];
  start: Scalars['String']['output'];
};

export type GetExerciseProgressQueryVariables = Exact<{
  exerciseId: Scalars['ID']['input'];
}>;


export type GetExerciseProgressQuery = { __typename?: 'Query', exerciseProgress: Array<{ __typename?: 'ExerciseProgressEntity', exerciseProgressId: string, date: string, sets: number, reps: number, weight: number }> };

export type GetExercisesDropdownQueryVariables = Exact<{ [key: string]: never; }>;


export type GetExercisesDropdownQuery = { __typename?: 'Query', exercises: Array<{ __typename?: 'ExerciseEntity', exerciseId: string, title: string, description: string, difficulty: string, muscleGroup: string, equipment: string, image?: string | null }> };

export type DeleteGoalsCategoryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteGoalsCategoryMutation = { __typename?: 'Mutation', deleteGoals: { __typename?: 'SuccessfulRemoval', isDeleted: boolean } };

export type DeleteFlashCardGroupMutationVariables = Exact<{
  groupId: Scalars['String']['input'];
}>;


export type DeleteFlashCardGroupMutation = { __typename?: 'Mutation', removeflashCardGroup: { __typename?: 'SuccessfulRemoval', isDeleted: boolean } };

export type GlobalAiChatMutationVariables = Exact<{
  input: AiChatInput;
}>;


export type GlobalAiChatMutation = { __typename?: 'Mutation', aiChat: { __typename?: 'AiChatResponse', messages: Array<{ __typename?: 'AiChatMessageItem', type: string, data?: string | null, subtype?: string | null }> } };

export type LoginUserMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginUserMutation = { __typename?: 'Mutation', loginAccount: { __typename?: 'CreateAccountOutput', token: string, email: string, id: string } };

export type CreateUserMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createAccount: { __typename?: 'CreateAccountOutput', token: string, email: string, id: string } };

export type GroupFieldsFragment = { __typename?: 'Group', id: string, name: string, description?: string | null, createdAt: any } & { ' $fragmentName'?: 'GroupFieldsFragment' };

export type FlashCardFieldsFragment = { __typename?: 'FlashCard', id: string, question: string, answer: string, explanation?: string | null, timesReviewed: number, correctAnswers: number, incorrectAnswers: number, successRate: number, lastReviewedAt?: any | null, difficultyLevel: number, createdAt: any, group: (
    { __typename?: 'Group' }
    & { ' $fragmentRefs'?: { 'GroupFieldsFragment': GroupFieldsFragment } }
  ) } & { ' $fragmentName'?: 'FlashCardFieldsFragment' };

export type GetGroupsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetGroupsQuery = { __typename?: 'Query', groups: Array<(
    { __typename?: 'Group' }
    & { ' $fragmentRefs'?: { 'GroupFieldsFragment': GroupFieldsFragment } }
  )> };

export type GetGroupQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetGroupQuery = { __typename?: 'Query', group: (
    { __typename?: 'Group', flashcards: Array<(
      { __typename?: 'FlashCard' }
      & { ' $fragmentRefs'?: { 'FlashCardFieldsFragment': FlashCardFieldsFragment } }
    )> }
    & { ' $fragmentRefs'?: { 'GroupFieldsFragment': GroupFieldsFragment } }
  ) };

export type CreateGroupMutationVariables = Exact<{
  input: CreateGroupInput;
}>;


export type CreateGroupMutation = { __typename?: 'Mutation', createGroup: (
    { __typename?: 'Group' }
    & { ' $fragmentRefs'?: { 'GroupFieldsFragment': GroupFieldsFragment } }
  ) };

export type UpdateGroupMutationVariables = Exact<{
  input: UpdateGroupInput;
}>;


export type UpdateGroupMutation = { __typename?: 'Mutation', updateGroup: (
    { __typename?: 'Group' }
    & { ' $fragmentRefs'?: { 'GroupFieldsFragment': GroupFieldsFragment } }
  ) };

export type DeleteGroupMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteGroupMutation = { __typename?: 'Mutation', removeGroup: boolean };

export type GetFlashCardsQueryVariables = Exact<{
  groupId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetFlashCardsQuery = { __typename?: 'Query', flashCards: Array<(
    { __typename?: 'FlashCard' }
    & { ' $fragmentRefs'?: { 'FlashCardFieldsFragment': FlashCardFieldsFragment } }
  )> };

export type GetGroupStatsQueryVariables = Exact<{
  groupId: Scalars['ID']['input'];
}>;


export type GetGroupStatsQuery = { __typename?: 'Query', groupStats: { __typename?: 'GroupStats', totalCards: number, averageSuccessRate: number, totalReviewed: number, masteredCards: number } };

export type CreateFlashCardMutationVariables = Exact<{
  input: CreateFlashCardInput;
}>;


export type CreateFlashCardMutation = { __typename?: 'Mutation', createFlashCard: (
    { __typename?: 'FlashCard' }
    & { ' $fragmentRefs'?: { 'FlashCardFieldsFragment': FlashCardFieldsFragment } }
  ) };

export type UpdateFlashCardMutationVariables = Exact<{
  input: UpdateFlashCardInput;
}>;


export type UpdateFlashCardMutation = { __typename?: 'Mutation', updateFlashCard: (
    { __typename?: 'FlashCard' }
    & { ' $fragmentRefs'?: { 'FlashCardFieldsFragment': FlashCardFieldsFragment } }
  ) };

export type ReviewFlashCardMutationVariables = Exact<{
  input: ReviewFlashCardInput;
}>;


export type ReviewFlashCardMutation = { __typename?: 'Mutation', reviewFlashCard: (
    { __typename?: 'FlashCard' }
    & { ' $fragmentRefs'?: { 'FlashCardFieldsFragment': FlashCardFieldsFragment } }
  ) };

export type DeleteFlashCardMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteFlashCardMutation = { __typename?: 'Mutation', removeFlashCard: { __typename?: 'SuccessfulRemoval', isDeleted: boolean } };

export type GenerateFlashCardsQueryVariables = Exact<{
  prompt: Scalars['String']['input'];
  groupId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GenerateFlashCardsQuery = { __typename?: 'Query', generateAIFlashcards: Array<{ __typename?: 'AIGeneratedFlashCards', question: string, answer: string, explanation: string }> };

export type WalletBalancePredictionQueryVariables = Exact<{
  toDate: Scalars['String']['input'];
}>;


export type WalletBalancePredictionQuery = { __typename?: 'Query', walletBalancePrediction: { __typename?: 'WalletBalancePrediction', currentBalance: number, avgMonthlyIncome: number, avgMonthlyExpense: number, avgMonthlyNet: number, historicalMonths: number, projections: Array<{ __typename?: 'BalanceProjection', month: number, year: number, monthsAhead: number, projectedBalance: number, avgMonthlyIncome: number, avgMonthlyExpense: number, avgMonthlyNet: number }> } };

export type GetNotificationSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetNotificationSettingsQuery = { __typename?: 'Query', getNotificationSettings: { __typename?: 'NotificationsEntity', id: string, isEnable: boolean, enabledNotifications: any } };

export type GetAvailableNotificationTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAvailableNotificationTypesQuery = { __typename?: 'Query', getAvailableNotificationTypes: Array<{ __typename?: 'NotificationTypeDto', key: string, title: string, description: string, category: string, schedule?: string | null }> };

export type ToggleEnabledNotificationsMutationVariables = Exact<{
  input: Scalars['JSON']['input'];
}>;


export type ToggleEnabledNotificationsMutation = { __typename?: 'Mutation', toggleEnabledNotifications: { __typename?: 'NotificationsEntity', id: string, isEnable: boolean, enabledNotifications: any } };

export type HomeExtrasQueryVariables = Exact<{
  filters?: InputMaybe<GetWalletFilters>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type HomeExtrasQuery = { __typename?: 'Query', limits: Array<{ __typename?: 'LimitsOutput', id: string, category: string, amount: number, current: number }>, subscriptions: Array<{ __typename?: 'SubscriptionEntity', id: string, amount: number, dateStart: string, dateEnd?: string | null, description: string, isActive: boolean, nextBillingDate: string, billingCycle: string, totalSpent: number, totalAmount: number, totalDuration: number }>, wallet: { __typename?: 'WalletEntity', expenses2: Array<{ __typename?: 'MonthlyExpenses', expenses: Array<{ __typename?: 'ExpenseEntity', id: string, amount: number, date: any, description: string, type: string, category?: string | null, subscription?: { __typename?: 'SubscriptionEntity', id: string, isActive: boolean } | null }> }> } };

export type HomeStatisticsDayOfWeekQueryVariables = Exact<{
  startDate: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
}>;


export type HomeStatisticsDayOfWeekQuery = { __typename?: 'Query', statisticsDayOfWeek: Array<{ __typename?: 'StatisticsDayOfWeekComparison', day: number, total: number }> };

export type HomeZeroSpendingsQueryVariables = Exact<{
  startDate: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
}>;


export type HomeZeroSpendingsQuery = { __typename?: 'Query', statisticsZeroExpenseDays: { __typename?: 'ZeroExpenseDays', days: Array<string>, saved: number, streak: Array<{ __typename?: 'ZeroExpenseStreak', start: string, end: string }> } };

export type GetMonthlyOccurrencesQueryVariables = Exact<{
  date: Scalars['String']['input'];
}>;


export type GetMonthlyOccurrencesQuery = { __typename?: 'Query', occurrenceMonth: Array<{ __typename?: 'MonthDay', date: string }> };

export type AddTodoFileMutationVariables = Exact<{
  input: AddTodoFileInput;
}>;


export type AddTodoFileMutation = { __typename?: 'Mutation', addTodoFile: { __typename?: 'TodoFilesEntity', id: string, type: string, url: string } };

export type CompleteOccurrenceMutationVariables = Exact<{
  input: CompleteOccurrenceInput;
}>;


export type CompleteOccurrenceMutation = { __typename?: 'Mutation', completeOccurrence: { __typename?: 'OccurrenceView', id: string, isCompleted: boolean } };

export type CompleteOccurrenceTodoMutationVariables = Exact<{
  input: CompleteOccurrenceTodoInput;
}>;


export type CompleteOccurrenceTodoMutation = { __typename?: 'Mutation', completeOccurrenceTodo: { __typename?: 'OccurrenceTodoEntity', isCompleted: boolean, id: string, title: string, modifiedAt: any, createdAt: any } };

export type CreateOccurrenceTodoMutationVariables = Exact<{
  input: CreateOccurrenceTodoInput;
}>;


export type CreateOccurrenceTodoMutation = { __typename?: 'Mutation', createOccurrenceTodo: { __typename?: 'OccurrenceTodoEntity', id: string, title: string, isCompleted: boolean, createdAt: any, modifiedAt: any, files: Array<{ __typename?: 'TodoFilesEntity', id: string, type: string, url: string }> } };

export type DeleteOccurrenceMutationVariables = Exact<{
  input: DeleteOccurrenceInput;
}>;


export type DeleteOccurrenceMutation = { __typename?: 'Mutation', deleteOccurrence: boolean };

export type EditOccurrenceMutationVariables = Exact<{
  input: EditOccurrenceArgsInput;
}>;


export type EditOccurrenceMutation = { __typename?: 'Mutation', editOccurrence: { __typename?: 'OccurrenceView', id: string, seriesId: string, date?: string | null, title: string, description: string, beginTime?: string | null, endTime?: string | null, isCompleted: boolean, isAllDay: boolean, isRepeat: boolean, tags: string, reminderBeforeMinutes?: number | null, todos: Array<{ __typename?: 'OccurrenceTodoView', id: string, title: string, isCompleted: boolean, createdAt: any, modifiedAt: any }>, images: Array<{ __typename?: 'OccurrenceFileView', id: string, url: string, type: string }> } };

export type CompleteOccurrenceTodoQuickMutationVariables = Exact<{
  input: CompleteOccurrenceTodoInput;
}>;


export type CompleteOccurrenceTodoQuickMutation = { __typename?: 'Mutation', completeOccurrenceTodo: { __typename?: 'OccurrenceTodoEntity', isCompleted: boolean, id: string, title: string, modifiedAt: any, createdAt: any } };

export type RemoveOccurrenceTodoMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RemoveOccurrenceTodoMutation = { __typename?: 'Mutation', removeOccurrenceTodo: boolean };

export type RemoveTodoFileMutationVariables = Exact<{
  fileId: Scalars['ID']['input'];
}>;


export type RemoveTodoFileMutation = { __typename?: 'Mutation', removeTodoFile: boolean };

export type TransferTodosMutationVariables = Exact<{
  input: TransferTodosInput;
}>;


export type TransferTodosMutation = { __typename?: 'Mutation', transferTodos: boolean };

export type GetOccurrenceByIdQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetOccurrenceByIdQuery = { __typename?: 'Query', occurrenceById: { __typename?: 'OccurrenceView', id: string, seriesId: string, date?: string | null, position: number, title: string, description: string, beginTime?: string | null, endTime?: string | null, isCompleted: boolean, isSkipped: boolean, isAllDay: boolean, isRepeat: boolean, tags: string, reminderBeforeMinutes?: number | null, todos: Array<{ __typename?: 'OccurrenceTodoView', id: string, title: string, isCompleted: boolean, createdAt: any, modifiedAt: any, files: Array<{ __typename?: 'TodoFilesEntity', id: string, type: string, url: string }> }>, images: Array<{ __typename?: 'OccurrenceFileView', id: string, url: string, type: string, name: string }> } };

export type GetOccurrencesQueryVariables = Exact<{
  date?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetOccurrencesQuery = { __typename?: 'Query', occurrences: Array<{ __typename?: 'OccurrenceView', id: string, seriesId: string, date?: string | null, title: string, description: string, beginTime?: string | null, endTime?: string | null, isCompleted: boolean, isSkipped: boolean, isRepeat: boolean, priority: number, reminderBeforeMinutes?: number | null, todos: Array<{ __typename?: 'OccurrenceTodoView', id: string, title: string, isCompleted: boolean }>, images: Array<{ __typename?: 'OccurrenceFileView', id: string }> }> };

export type GetCalendarOccurrencesQueryVariables = Exact<{
  date?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetCalendarOccurrencesQuery = { __typename?: 'Query', occurrences: Array<{ __typename?: 'OccurrenceView', id: string, title: string, date?: string | null, beginTime?: string | null, endTime?: string | null, isCompleted: boolean }> };

export type GetMissedOccurrencesQueryVariables = Exact<{
  filters?: InputMaybe<OccurrenceFiltersInput>;
}>;


export type GetMissedOccurrencesQuery = { __typename?: 'Query', occurrences: Array<{ __typename?: 'OccurrenceView', id: string, seriesId: string, date?: string | null, title: string, description: string, beginTime?: string | null, endTime?: string | null, isCompleted: boolean, isSkipped: boolean, isRepeat: boolean, priority: number, reminderBeforeMinutes?: number | null, todos: Array<{ __typename?: 'OccurrenceTodoView', id: string, title: string, isCompleted: boolean }>, images: Array<{ __typename?: 'OccurrenceFileView', id: string }> }> };

export type OccurrenceFieldsFragment = { __typename?: 'OccurrenceView', id: string, seriesId: string, date?: string | null, position: number, title: string, description: string, beginTime?: string | null, endTime?: string | null, isCompleted: boolean, isSkipped: boolean, isAllDay: boolean, isRepeat: boolean, tags: string, priority: number, reminderBeforeMinutes?: number | null, todos: Array<{ __typename?: 'OccurrenceTodoView', id: string, title: string, isCompleted: boolean, createdAt: any, modifiedAt: any, files: Array<{ __typename?: 'TodoFilesEntity', id: string, type: string, url: string }> }>, images: Array<{ __typename?: 'OccurrenceFileView', id: string, url: string, type: string, name: string }> } & { ' $fragmentName'?: 'OccurrenceFieldsFragment' };

export type CreateEventMutationVariables = Exact<{
  input: CreateEventWithRepeatInput;
}>;


export type CreateEventMutation = { __typename?: 'Mutation', createEvent: (
    { __typename?: 'OccurrenceView' }
    & { ' $fragmentRefs'?: { 'OccurrenceFieldsFragment': OccurrenceFieldsFragment } }
  ) };

export type CopyOccurrenceMutationVariables = Exact<{
  input: CopyOccurrenceArgsInput;
}>;


export type CopyOccurrenceMutation = { __typename?: 'Mutation', copyOccurrence: (
    { __typename?: 'OccurrenceView' }
    & { ' $fragmentRefs'?: { 'OccurrenceFieldsFragment': OccurrenceFieldsFragment } }
  ) };

export type GetOccurrenceTodoQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetOccurrenceTodoQuery = { __typename?: 'Query', occurrenceTodo: { __typename?: 'OccurrenceTodoEntity', id: string, title: string, isCompleted: boolean, modifiedAt: any, files: Array<{ __typename?: 'TodoFilesEntity', id: string, type: string, url: string }> } };

export type CreateExpenseFormMutationVariables = Exact<{
  input: CreateExpenseInput;
}>;


export type CreateExpenseFormMutation = { __typename?: 'Mutation', createExpense: { __typename?: 'ExpenseEntity', id: string, amount: number, description: string, date: any, type: string, category?: string | null } };

export type EditExpenseFormMutationVariables = Exact<{
  input: EditExpenseInput;
}>;


export type EditExpenseFormMutation = { __typename?: 'Mutation', editExpense: { __typename?: 'ExpenseEntity', id: string } };

export type EditOccurrenceFormMutationVariables = Exact<{
  input: EditOccurrenceArgsInput;
}>;


export type EditOccurrenceFormMutation = { __typename?: 'Mutation', editOccurrence: { __typename?: 'OccurrenceView', id: string, title: string, date?: string | null, beginTime?: string | null, endTime?: string | null } };

export type AiPhotoPredictionMutationVariables = Exact<{
  image: Scalars['String']['input'];
}>;


export type AiPhotoPredictionMutation = { __typename?: 'Mutation', createExpenseFromImage: { __typename?: 'ExpenseEntity', id: string, amount: number, date: any, description: string, type: string, category?: string | null, balanceBeforeInteraction?: number | null, note?: string | null, spontaneousRate?: number | null, subexpenses: Array<{ __typename?: 'ExpenseSubExpense', id: string, description: string, amount: number, category: string }> } };

export type GetExpenseSuggestionsQueryVariables = Exact<{
  filters?: InputMaybe<GetWalletFilters>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetExpenseSuggestionsQuery = { __typename?: 'Query', wallet: { __typename?: 'WalletEntity', expenses2: Array<{ __typename?: 'MonthlyExpenses', expenses: Array<{ __typename?: 'ExpenseEntity', id: string, description: string, amount: number, category?: string | null }> }> } };

export type SearchLocationsQueryVariables = Exact<{
  query?: InputMaybe<Scalars['String']['input']>;
}>;


export type SearchLocationsQuery = { __typename?: 'Query', locations: Array<{ __typename?: 'ExpenseLocationEntity', id: string, name: string, kind: string, latitude: number, longitude: number }> };

export type CreateLocationMutationVariables = Exact<{
  input: CreateLocationDto;
}>;


export type CreateLocationMutation = { __typename?: 'Mutation', createLocation: { __typename?: 'ExpenseLocationEntity', id: string, name: string, kind: string, latitude: number, longitude: number } };

export type AddExpenseLocationMutationVariables = Exact<{
  input: AddExpenseLocationInput;
}>;


export type AddExpenseLocationMutation = { __typename?: 'Mutation', addExpenseLocation: boolean };

export type GetMonthTotalQueryVariables = Exact<{
  date: Scalars['String']['input'];
}>;


export type GetMonthTotalQuery = { __typename?: 'Query', getMonthTotal: number };

export type CreateWalletMutationVariables = Exact<{
  balance: Scalars['Float']['input'];
}>;


export type CreateWalletMutation = { __typename?: 'Mutation', createWallet: boolean };

export type LimitsQueryVariables = Exact<{
  range: Scalars['String']['input'];
  date?: InputMaybe<Scalars['String']['input']>;
}>;


export type LimitsQuery = { __typename?: 'Query', limits: Array<{ __typename?: 'LimitsOutput', id: string, category: string, amount: number, current: number }> };

export type GetWalletLimitsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWalletLimitsQuery = { __typename?: 'Query', wallet: { __typename?: 'WalletEntity', income: number, monthlyPercentageTarget: number } };

export type WalletNotificationsQueryVariables = Exact<{
  skip: Scalars['Int']['input'];
  take: Scalars['Int']['input'];
}>;


export type WalletNotificationsQuery = { __typename?: 'Query', notifications: Array<{ __typename?: 'NotificationsHistoryEntity', id: string, message: any, sendAt: any, read: boolean }> };

export type ReadNotificationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ReadNotificationMutation = { __typename?: 'Mutation', readNotification: boolean };

export type HourlySpendingsQueryVariables = Exact<{
  months: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type HourlySpendingsQuery = { __typename?: 'Query', hourlySpendingsHeatMap: Array<{ __typename?: 'HourlyStats', hour: number, count: number, avg_amount: number, min_amount: number, max_amount: number, std_deviation: number, variance: number }> };

export type LimitsComparisonQueryVariables = Exact<{
  startDate: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
}>;


export type LimitsComparisonQuery = { __typename?: 'Query', statisticsSpendingsLimits: Array<{ __typename?: 'MonthlyLimitResult', month: string, totalSpent: number, generalLimit: number, generalLimitExceeded: boolean, categories: Array<{ __typename?: 'CategoryLimitResult', category: string, spent: number, limit: number, exceeded: boolean }> }> };

export type MonthlyCategoryComparisonQueryVariables = Exact<{
  months: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type MonthlyCategoryComparisonQuery = { __typename?: 'Query', monthlyCategoryComparison: Array<{ __typename?: 'MonthlyCategoryComparisonOutput', month?: string | null, categories?: Array<{ __typename?: 'MonthlyCategoryComparisonItem', category: string, total: number, avg: number, count: number }> | null }> };

export type MonthlyDateSpendingsQueryVariables = Exact<{
  months: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type MonthlyDateSpendingsQuery = { __typename?: 'Query', monthlyDateSpendings: Array<{ __typename?: 'MonthlyHeatMap', dayOfMonth: number, totalCount: number, totalAmount: number, averageAmount: number }> };

export type StatisticsDayOfWeekQueryVariables = Exact<{
  startDate: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
}>;


export type StatisticsDayOfWeekQuery = { __typename?: 'Query', statisticsDayOfWeek: Array<{ __typename?: 'StatisticsDayOfWeekComparison', day: number, total: number, avg: number, median: number, count: number }> };

export type PreviousStatisticsDayOfWeekQueryVariables = Exact<{
  startDate: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
}>;


export type PreviousStatisticsDayOfWeekQuery = { __typename?: 'Query', statisticsDayOfWeek: Array<{ __typename?: 'StatisticsDayOfWeekComparison', day: number, total: number, avg: number, median: number, count: number }> };

export type GetZeroSpendingsQueryVariables = Exact<{
  startDate: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
}>;


export type GetZeroSpendingsQuery = { __typename?: 'Query', statisticsZeroExpenseDays: { __typename?: 'ZeroExpenseDays', days: Array<string>, avg: number, saved: number, streak: Array<{ __typename?: 'ZeroExpenseStreak', start: string, end: string, length: number }> } };

export type CorrectionMapsQueryVariables = Exact<{ [key: string]: never; }>;


export type CorrectionMapsQuery = { __typename?: 'Query', correctionMaps: Array<{ __typename?: 'ExpenseCorrectionMapEntity', id: string, matchShop?: string | null, matchDescription?: string | null, matchCategory?: string | null, matchAmountMin?: number | null, matchAmountMax?: number | null, overrideShop?: string | null, overrideCategory?: string | null, overrideDescription?: string | null, isActive: boolean, createdAt: any }> };

export type CreateCorrectionMapMutationVariables = Exact<{
  input: CreateCorrectionMapDto;
}>;


export type CreateCorrectionMapMutation = { __typename?: 'Mutation', createCorrectionMap: { __typename?: 'ExpenseCorrectionMapEntity', id: string, matchShop?: string | null, matchDescription?: string | null, matchCategory?: string | null, matchAmountMin?: number | null, matchAmountMax?: number | null, overrideShop?: string | null, overrideCategory?: string | null, overrideDescription?: string | null, isActive: boolean, createdAt: any } };

export type UpdateCorrectionMapMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateCorrectionMapDto;
}>;


export type UpdateCorrectionMapMutation = { __typename?: 'Mutation', updateCorrectionMap: { __typename?: 'ExpenseCorrectionMapEntity', id: string, matchShop?: string | null, matchDescription?: string | null, matchCategory?: string | null, matchAmountMin?: number | null, matchAmountMax?: number | null, overrideShop?: string | null, overrideCategory?: string | null, overrideDescription?: string | null, isActive: boolean, createdAt: any } };

export type DeleteCorrectionMapMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteCorrectionMapMutation = { __typename?: 'Mutation', deleteCorrectionMap: boolean };

export type CreateExpenseMutationVariables = Exact<{
  input: CreateExpenseInput;
}>;


export type CreateExpenseMutation = { __typename?: 'Mutation', createExpense: { __typename?: 'ExpenseEntity', id: string, amount: number, description: string, date: any, type: string, category?: string | null, balanceBeforeInteraction?: number | null, schedule: boolean, subscription?: { __typename?: 'SubscriptionEntity', id: string, isActive: boolean, nextBillingDate: string, dateStart: string } | null, subexpenses: Array<{ __typename?: 'ExpenseSubExpense', id: string, description: string, amount: number, category: string }>, files: Array<{ __typename?: 'ExpenseFileEntity', id: string, url: string }> } };

export type DeleteActivityMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteActivityMutation = { __typename?: 'Mutation', deleteExpense: string };

export type EditExpenseNoteMutationVariables = Exact<{
  input: EditExpenseNoteInput;
}>;


export type EditExpenseNoteMutation = { __typename?: 'Mutation', editExpenseNote: boolean };

export type EditExpenseMutationVariables = Exact<{
  input: EditExpenseInput;
}>;


export type EditExpenseMutation = { __typename?: 'Mutation', editExpense: { __typename?: 'ExpenseEntity', id: string } };

export type EditBalanceMutationVariables = Exact<{
  input: EditWalletBalanceInput;
}>;


export type EditBalanceMutation = { __typename?: 'Mutation', editWalletBalance: { __typename?: 'WalletEntity', id: string, balance: number, income: number, paycheckDate?: string | null } };

export type StatisticsLegendQueryVariables = Exact<{
  startDate: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
  detailed: Scalars['String']['input'];
}>;


export type StatisticsLegendQuery = { __typename?: 'Query', statisticsLegend: Array<{ __typename?: 'StatisticsLegend', category: string, count: string, total: number, percentage: number }> };

export type WalletStatisticsQueryVariables = Exact<{
  range: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type WalletStatisticsQuery = { __typename?: 'Query', statistics: { __typename?: 'WalletStatisticsRange', total?: number | null, average?: number | null, max?: number | null, min?: number | null, count?: number | null, theMostCommonCategory?: string | null, theLeastCommonCategory?: string | null, lastBalance?: number | null, income?: number | null, expense?: number | null } };

export type SubscriptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type SubscriptionsQuery = { __typename?: 'Query', subscriptions: Array<{ __typename?: 'SubscriptionEntity', id: string, amount: number, dateStart: string, dateEnd?: string | null, description: string, isActive: boolean, nextBillingDate: string, billingCycle: string, billingDay?: number | null, customBillingMonths?: Array<number> | null, reminderDaysBeforehand: number, totalSpent: number, totalAmount: number, totalDuration: number, expenses: Array<{ __typename?: 'ExpenseEntity', id: string, amount: number, date: any, description: string, category?: string | null }> }> };

export type GetWalletQueryVariables = Exact<{
  filters?: InputMaybe<GetWalletFilters>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  includeFiles?: InputMaybe<Scalars['Boolean']['input']>;
  includeSubexpenses?: InputMaybe<Scalars['Boolean']['input']>;
  includeSubscription?: InputMaybe<Scalars['Boolean']['input']>;
  includeLocation?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetWalletQuery = { __typename?: 'Query', wallet: { __typename?: 'WalletEntity', id: string, balance: number, income: number, monthlyPercentageTarget: number, expenses2: Array<{ __typename?: 'MonthlyExpenses', month: string, flow: { __typename?: 'MonthlyFlow', income: number, expense: number }, expenses: Array<{ __typename?: 'ExpenseEntity', id: string, amount: number, date: any, description: string, type: string, category?: string | null, spontaneousRate?: number | null, subAccountId?: string | null, subscription?: { __typename?: 'SubscriptionEntity', id: string, isActive: boolean, nextBillingDate: string, dateStart: string } | null, location?: { __typename?: 'ExpenseLocationEntity', id: string } | null, files?: Array<{ __typename?: 'ExpenseFileEntity', id: string }>, subexpenses?: Array<{ __typename?: 'ExpenseSubExpense', id: string }> }> }> } };

export type PredictExpenseQueryVariables = Exact<{
  input: Scalars['String']['input'];
  amount?: InputMaybe<Scalars['Float']['input']>;
}>;


export type PredictExpenseQuery = { __typename?: 'Query', predictExpense?: { __typename?: 'ExpensePredictionType', description: string, amount: number, category: string, type: string, shop?: string | null, locationId?: string | null, confidence: number } | null };

export type ReadAllNotificationsMutationVariables = Exact<{ [key: string]: never; }>;


export type ReadAllNotificationsMutation = { __typename?: 'Mutation', readAllNotifications: boolean };

export type RefundExpenseMutationVariables = Exact<{
  expenseId: Scalars['ID']['input'];
}>;


export type RefundExpenseMutation = { __typename?: 'Mutation', refundExpense: { __typename?: 'ExpenseEntity', id: string, type: string } };

export type SubAccountsQueryVariables = Exact<{ [key: string]: never; }>;


export type SubAccountsQuery = { __typename?: 'Query', wallet: { __typename?: 'WalletEntity', subAccounts: Array<{ __typename?: 'WalletSubAccount', id: string, name: string, description?: string | null, color?: string | null, icon?: string | null, balance: number, isDefault: boolean, income?: number | null, expense?: number | null }> } };

export type CreateSubAccountMutationVariables = Exact<{
  input: CreateSubAccountInput;
}>;


export type CreateSubAccountMutation = { __typename?: 'Mutation', createSubAccount: { __typename?: 'WalletSubAccount', id: string, name: string, balance: number } };

export type UpdateSubAccountMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateSubAccountInput;
}>;


export type UpdateSubAccountMutation = { __typename?: 'Mutation', updateSubAccount: { __typename?: 'WalletSubAccount', id: string, name: string, balance: number } };

export type DeleteSubAccountMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteSubAccountMutation = { __typename?: 'Mutation', deleteSubAccount: boolean };

export type TransferBetweenSubAccountsMutationVariables = Exact<{
  input: TransferBetweenSubAccountsInput;
}>;


export type TransferBetweenSubAccountsMutation = { __typename?: 'Mutation', transferBetweenSubAccounts: { __typename?: 'TransferResult', from: string, to: string } };

export type ModifySubscriptionMutationVariables = Exact<{
  input: UpdateSubscriptionInput;
}>;


export type ModifySubscriptionMutation = { __typename?: 'Mutation', modifySubscription: { __typename?: 'SubscriptionEntity', id: string, amount: number, dateStart: string, dateEnd?: string | null, description: string, isActive: boolean, nextBillingDate: string, billingCycle: string, billingDay?: number | null, customBillingMonths?: Array<number> | null, reminderDaysBeforehand: number } };

export type CancelSubscriptionMutationVariables = Exact<{
  subscriptionId: Scalars['ID']['input'];
}>;


export type CancelSubscriptionMutation = { __typename?: 'Mutation', cancelSubscription: { __typename?: 'ExpenseEntity', id: string, amount: number, date: any, description: string, type: string, category?: string | null, balanceBeforeInteraction?: number | null, note?: string | null, subscription?: { __typename?: 'SubscriptionEntity', id: string, isActive: boolean, nextBillingDate: string, dateStart: string } | null } };

export type CreateSubscriptionMutationVariables = Exact<{
  expenseId: Scalars['ID']['input'];
}>;


export type CreateSubscriptionMutation = { __typename?: 'Mutation', createSubscription: { __typename?: 'ExpenseEntity', id: string, amount: number, date: any, description: string, type: string, category?: string | null, balanceBeforeInteraction?: number | null, note?: string | null, subscription?: { __typename?: 'SubscriptionEntity', id: string, isActive: boolean, nextBillingDate: string, dateStart: string } | null } };

export type CreateSubscriptionFromInputMutationVariables = Exact<{
  input: CreateSubscriptionInput;
}>;


export type CreateSubscriptionFromInputMutation = { __typename?: 'Mutation', create: { __typename?: 'SubscriptionEntity', id: string, amount: number, dateStart: string, dateEnd?: string | null, description: string, isActive: boolean, nextBillingDate: string, billingCycle: string, billingDay?: number | null, customBillingMonths?: Array<number> | null, reminderDaysBeforehand: number } };

export type RenewSubscriptionMutationVariables = Exact<{
  subscriptionId: Scalars['ID']['input'];
}>;


export type RenewSubscriptionMutation = { __typename?: 'Mutation', renewSubscription: { __typename?: 'ExpenseEntity', id: string, amount: number, date: any, description: string, type: string, category?: string | null, balanceBeforeInteraction?: number | null, note?: string | null, subscription?: { __typename?: 'SubscriptionEntity', id: string, isActive: boolean, nextBillingDate: string, dateStart: string } | null } };

export type AssignExpenseToSubscriptionMutationVariables = Exact<{
  input: AssignExpenseToSubscriptionInput;
}>;


export type AssignExpenseToSubscriptionMutation = { __typename?: 'Mutation', assignExpenseToSubscription: { __typename?: 'ExpenseEntity', id: string, amount: number, date: any, description: string, type: string, category?: string | null, balanceBeforeInteraction?: number | null, note?: string | null, subscription?: { __typename?: 'SubscriptionEntity', id: string, isActive: boolean, nextBillingDate: string, dateStart: string } | null } };

export type UploadSubExpenseMutationVariables = Exact<{
  input: AddMultipleSubExpensesInput;
}>;


export type UploadSubExpenseMutation = { __typename?: 'Mutation', addMultipleSubExpenses: Array<{ __typename?: 'ExpenseSubExpense', id: string, description: string, amount: number, category: string }> };

export type AiChatMessageFieldsFragment = { __typename?: 'AiChatMessageItem', type: string, data?: string | null, subtype?: string | null } & { ' $fragmentName'?: 'AiChatMessageFieldsFragment' };

export type StatisticsAiChatMutationVariables = Exact<{
  input: AiChatInput;
}>;


export type StatisticsAiChatMutation = { __typename?: 'Mutation', aiChat: { __typename?: 'AiChatResponse', messages: Array<(
      { __typename?: 'AiChatMessageItem' }
      & { ' $fragmentRefs'?: { 'AiChatMessageFieldsFragment': AiChatMessageFieldsFragment } }
    )> } };

export type GetStatisticsAiChatHistoryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStatisticsAiChatHistoryQuery = { __typename?: 'Query', aiChatHistory: Array<{ __typename?: 'AiChatResponse', messages: Array<(
      { __typename?: 'AiChatMessageItem' }
      & { ' $fragmentRefs'?: { 'AiChatMessageFieldsFragment': AiChatMessageFieldsFragment } }
    )> }> };

export type CreateLimitMutationVariables = Exact<{
  input: CreateLimit;
}>;


export type CreateLimitMutation = { __typename?: 'Mutation', createLimit: { __typename?: 'WalletLimits', id: string } };

export type ExpenseQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ExpenseQuery = { __typename?: 'Query', expense: (
    { __typename?: 'ExpenseEntity' }
    & { ' $fragmentRefs'?: { 'ExpenseDetailsFragment': ExpenseDetailsFragment } }
  ), expenseSimilar: Array<(
    { __typename?: 'ExpenseEntity' }
    & { ' $fragmentRefs'?: { 'ExpenseDetailsFragment': ExpenseDetailsFragment } }
  )>, wallet: { __typename?: 'WalletEntity', income: number, monthlyPercentageTarget: number } };

export type ExpenseDetailsFragment = { __typename?: 'ExpenseEntity', id: string, amount: number, date: any, description: string, type: string, category?: string | null, balanceBeforeInteraction?: number | null, spontaneousRate?: number | null, subAccountId?: string | null, note?: string | null, subscription?: { __typename?: 'SubscriptionEntity', id: string, isActive: boolean, nextBillingDate: string, dateStart: string } | null, location?: { __typename?: 'ExpenseLocationEntity', id: string, kind: string, name: string, latitude: number, longitude: number } | null, files: Array<{ __typename?: 'ExpenseFileEntity', id: string, url: string }>, subexpenses: Array<{ __typename?: 'ExpenseSubExpense', id: string, description: string, amount: number, category: string }> } & { ' $fragmentName'?: 'ExpenseDetailsFragment' };

export type DeleteSubExpenseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteSubExpenseMutation = { __typename?: 'Mutation', deleteSubExpense: boolean };

export type GetExpensesForLimitsQueryVariables = Exact<{
  filters?: InputMaybe<GetWalletFilters>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetExpensesForLimitsQuery = { __typename?: 'Query', wallet: { __typename?: 'WalletEntity', expenses2: Array<{ __typename?: 'MonthlyExpenses', expenses: Array<{ __typename?: 'ExpenseEntity', id: string, amount: number, date: any, description: string, type: string, category?: string | null }> }> } };

export type SubscriptionQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type SubscriptionQuery = { __typename?: 'Query', subscription: { __typename?: 'SubscriptionEntity', id: string, amount: number, dateStart: string, dateEnd?: string | null, description: string, isActive: boolean, nextBillingDate: string, billingCycle: string, billingDay?: number | null, customBillingMonths?: Array<number> | null, reminderDaysBeforehand: number, expenses: Array<{ __typename?: 'ExpenseEntity', id: string, amount: number, date: any, description: string, category?: string | null, balanceBeforeInteraction?: number | null, note?: string | null }> } };

export type CreateNotificationMutationVariables = Exact<{
  input: SetNotificationsTokenInput;
}>;


export type CreateNotificationMutation = { __typename?: 'Mutation', setNotificationsToken: boolean };

export type RefreshTokenMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshTokenMutation = { __typename?: 'Mutation', refreshToken: string };

export type GetRootViewQueryVariables = Exact<{
  range: Array<Scalars['String']['input']> | Scalars['String']['input'];
  lastRange: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type GetRootViewQuery = { __typename?: 'Query', wallet: { __typename?: 'WalletEntity', id: string, balance: number, income: number, monthlyPercentageTarget: number }, monthlySpendings: (
    { __typename?: 'WalletStatisticsRange' }
    & { ' $fragmentRefs'?: { 'StatsFragment': StatsFragment } }
  ), lastMonthSpendings: (
    { __typename?: 'WalletStatisticsRange' }
    & { ' $fragmentRefs'?: { 'StatsFragment': StatsFragment } }
  ) };

export type StatsFragment = { __typename?: 'WalletStatisticsRange', total?: number | null, average?: number | null, max?: number | null, min?: number | null, count?: number | null, theMostCommonCategory?: string | null, theLeastCommonCategory?: string | null, lastBalance?: number | null, income?: number | null, expense?: number | null } & { ' $fragmentName'?: 'StatsFragment' };

export type AddExerciseProgressMutationVariables = Exact<{
  exerciseId: Scalars['ID']['input'];
  sets: Scalars['Int']['input'];
  reps: Scalars['Int']['input'];
  weight: Scalars['Float']['input'];
}>;


export type AddExerciseProgressMutation = { __typename?: 'Mutation', createExerciseProgress: { __typename?: 'ExerciseProgressEntity', exerciseProgressId: string, sets: number, reps: number, weight: number, date: string } };

export type CompleteOccurrenceFromWidgetMutationVariables = Exact<{
  input: CompleteOccurrenceInput;
}>;


export type CompleteOccurrenceFromWidgetMutation = { __typename?: 'Mutation', completeOccurrence: { __typename?: 'OccurrenceView', id: string, isCompleted: boolean } };

export type CompleteOccurrenceTodoFromWidgetMutationVariables = Exact<{
  input: CompleteOccurrenceTodoInput;
}>;


export type CompleteOccurrenceTodoFromWidgetMutation = { __typename?: 'Mutation', completeOccurrenceTodo: { __typename?: 'OccurrenceTodoEntity', id: string, isCompleted: boolean } };

export type WidgetAnalyticsQueryVariables = Exact<{
  range: Scalars['String']['input'];
  date?: InputMaybe<Scalars['String']['input']>;
  statsRange: Array<Scalars['String']['input']> | Scalars['String']['input'];
  startDate: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
  detailed: Scalars['String']['input'];
}>;


export type WidgetAnalyticsQuery = { __typename?: 'Query', limits: Array<{ __typename?: 'LimitsOutput', id: string, category: string, amount: number, current: number }>, statistics: { __typename?: 'WalletStatisticsRange', total?: number | null, average?: number | null, max?: number | null, min?: number | null, count?: number | null, theMostCommonCategory?: string | null, theLeastCommonCategory?: string | null, lastBalance?: number | null, income?: number | null, expense?: number | null }, statisticsDayOfWeek: Array<{ __typename?: 'StatisticsDayOfWeekComparison', day: number, total: number, avg: number, median: number, count: number }>, statisticsLegend: Array<{ __typename?: 'StatisticsLegend', category: string, count: string, total: number, percentage: number }>, wallet: { __typename?: 'WalletEntity', id: string, balance: number, income: number, monthlyPercentageTarget: number } };

export type ExpensesLegendQueryVariables = Exact<{
  startDate: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
  detailed: Scalars['String']['input'];
}>;


export type ExpensesLegendQuery = { __typename?: 'Query', statisticsLegend: Array<{ __typename?: 'StatisticsLegend', category: string, count: string, total: number, percentage: number }> };

export const GroupFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Group"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<GroupFieldsFragment, unknown>;
export const FlashCardFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FlashCardFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"FlashCard"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"question"}},{"kind":"Field","name":{"kind":"Name","value":"answer"}},{"kind":"Field","name":{"kind":"Name","value":"explanation"}},{"kind":"Field","name":{"kind":"Name","value":"timesReviewed"}},{"kind":"Field","name":{"kind":"Name","value":"correctAnswers"}},{"kind":"Field","name":{"kind":"Name","value":"incorrectAnswers"}},{"kind":"Field","name":{"kind":"Name","value":"successRate"}},{"kind":"Field","name":{"kind":"Name","value":"lastReviewedAt"}},{"kind":"Field","name":{"kind":"Name","value":"difficultyLevel"}},{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GroupFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Group"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FlashCardFieldsFragment, unknown>;
export const OccurrenceFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OccurrenceFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OccurrenceView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"seriesId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"beginTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"isSkipped"}},{"kind":"Field","name":{"kind":"Name","value":"isAllDay"}},{"kind":"Field","name":{"kind":"Name","value":"isRepeat"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"reminderBeforeMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"todos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"modifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"files"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<OccurrenceFieldsFragment, unknown>;
export const AiChatMessageFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AiChatMessageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AiChatMessageItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"subtype"}}]}}]} as unknown as DocumentNode<AiChatMessageFieldsFragment, unknown>;
export const ExpenseDetailsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ExpenseDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ExpenseEntity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"balanceBeforeInteraction"}},{"kind":"Field","name":{"kind":"Name","value":"spontaneousRate"}},{"kind":"Field","name":{"kind":"Name","value":"subAccountId"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"subscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"nextBillingDate"}},{"kind":"Field","name":{"kind":"Name","value":"dateStart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}},{"kind":"Field","name":{"kind":"Name","value":"files"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subexpenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]}}]} as unknown as DocumentNode<ExpenseDetailsFragment, unknown>;
export const StatsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Stats"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WalletStatisticsRange"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"average"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"theMostCommonCategory"}},{"kind":"Field","name":{"kind":"Name","value":"theLeastCommonCategory"}},{"kind":"Field","name":{"kind":"Name","value":"lastBalance"}},{"kind":"Field","name":{"kind":"Name","value":"income"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}}]}}]} as unknown as DocumentNode<StatsFragment, unknown>;
export const GetExerciseProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetExerciseProgress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"exerciseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exerciseProgress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"exerciseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"exerciseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exerciseProgressId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"sets"}},{"kind":"Field","name":{"kind":"Name","value":"reps"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}}]}}]}}]} as unknown as DocumentNode<GetExerciseProgressQuery, GetExerciseProgressQueryVariables>;
export const GetExercisesDropdownDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetExercisesDropdown"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exercises"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exerciseId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"difficulty"}},{"kind":"Field","name":{"kind":"Name","value":"muscleGroup"}},{"kind":"Field","name":{"kind":"Name","value":"equipment"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]}}]} as unknown as DocumentNode<GetExercisesDropdownQuery, GetExercisesDropdownQueryVariables>;
export const DeleteGoalsCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteGoalsCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteGoals"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}}]}}]}}]} as unknown as DocumentNode<DeleteGoalsCategoryMutation, DeleteGoalsCategoryMutationVariables>;
export const DeleteFlashCardGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteFlashCardGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeflashCardGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"groupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}}]}}]}}]} as unknown as DocumentNode<DeleteFlashCardGroupMutation, DeleteFlashCardGroupMutationVariables>;
export const GlobalAiChatDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GlobalAiChat"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AiChatInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"aiChat"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"subtype"}}]}}]}}]}}]} as unknown as DocumentNode<GlobalAiChatMutation, GlobalAiChatMutationVariables>;
export const LoginUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"loginUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loginAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"account"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<LoginUserMutation, LoginUserMutationVariables>;
export const CreateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"account"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateUserMutation, CreateUserMutationVariables>;
export const GetGroupsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GroupFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Group"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<GetGroupsQuery, GetGroupsQueryVariables>;
export const GetGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GroupFields"}},{"kind":"Field","name":{"kind":"Name","value":"flashcards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FlashCardFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Group"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FlashCardFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"FlashCard"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"question"}},{"kind":"Field","name":{"kind":"Name","value":"answer"}},{"kind":"Field","name":{"kind":"Name","value":"explanation"}},{"kind":"Field","name":{"kind":"Name","value":"timesReviewed"}},{"kind":"Field","name":{"kind":"Name","value":"correctAnswers"}},{"kind":"Field","name":{"kind":"Name","value":"incorrectAnswers"}},{"kind":"Field","name":{"kind":"Name","value":"successRate"}},{"kind":"Field","name":{"kind":"Name","value":"lastReviewedAt"}},{"kind":"Field","name":{"kind":"Name","value":"difficultyLevel"}},{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GroupFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<GetGroupQuery, GetGroupQueryVariables>;
export const CreateGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateGroupInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GroupFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Group"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CreateGroupMutation, CreateGroupMutationVariables>;
export const UpdateGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateGroupInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GroupFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Group"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UpdateGroupMutation, UpdateGroupMutationVariables>;
export const DeleteGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteGroupMutation, DeleteGroupMutationVariables>;
export const GetFlashCardsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFlashCards"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"flashCards"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"groupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FlashCardFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Group"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FlashCardFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"FlashCard"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"question"}},{"kind":"Field","name":{"kind":"Name","value":"answer"}},{"kind":"Field","name":{"kind":"Name","value":"explanation"}},{"kind":"Field","name":{"kind":"Name","value":"timesReviewed"}},{"kind":"Field","name":{"kind":"Name","value":"correctAnswers"}},{"kind":"Field","name":{"kind":"Name","value":"incorrectAnswers"}},{"kind":"Field","name":{"kind":"Name","value":"successRate"}},{"kind":"Field","name":{"kind":"Name","value":"lastReviewedAt"}},{"kind":"Field","name":{"kind":"Name","value":"difficultyLevel"}},{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GroupFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<GetFlashCardsQuery, GetFlashCardsQueryVariables>;
export const GetGroupStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetGroupStats"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"groupStats"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"groupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCards"}},{"kind":"Field","name":{"kind":"Name","value":"averageSuccessRate"}},{"kind":"Field","name":{"kind":"Name","value":"totalReviewed"}},{"kind":"Field","name":{"kind":"Name","value":"masteredCards"}}]}}]}}]} as unknown as DocumentNode<GetGroupStatsQuery, GetGroupStatsQueryVariables>;
export const CreateFlashCardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateFlashCard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFlashCardInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createFlashCard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FlashCardFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Group"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FlashCardFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"FlashCard"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"question"}},{"kind":"Field","name":{"kind":"Name","value":"answer"}},{"kind":"Field","name":{"kind":"Name","value":"explanation"}},{"kind":"Field","name":{"kind":"Name","value":"timesReviewed"}},{"kind":"Field","name":{"kind":"Name","value":"correctAnswers"}},{"kind":"Field","name":{"kind":"Name","value":"incorrectAnswers"}},{"kind":"Field","name":{"kind":"Name","value":"successRate"}},{"kind":"Field","name":{"kind":"Name","value":"lastReviewedAt"}},{"kind":"Field","name":{"kind":"Name","value":"difficultyLevel"}},{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GroupFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CreateFlashCardMutation, CreateFlashCardMutationVariables>;
export const UpdateFlashCardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateFlashCard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateFlashCardInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateFlashCard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FlashCardFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Group"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FlashCardFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"FlashCard"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"question"}},{"kind":"Field","name":{"kind":"Name","value":"answer"}},{"kind":"Field","name":{"kind":"Name","value":"explanation"}},{"kind":"Field","name":{"kind":"Name","value":"timesReviewed"}},{"kind":"Field","name":{"kind":"Name","value":"correctAnswers"}},{"kind":"Field","name":{"kind":"Name","value":"incorrectAnswers"}},{"kind":"Field","name":{"kind":"Name","value":"successRate"}},{"kind":"Field","name":{"kind":"Name","value":"lastReviewedAt"}},{"kind":"Field","name":{"kind":"Name","value":"difficultyLevel"}},{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GroupFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<UpdateFlashCardMutation, UpdateFlashCardMutationVariables>;
export const ReviewFlashCardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReviewFlashCard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewFlashCardInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reviewFlashCard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FlashCardFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Group"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FlashCardFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"FlashCard"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"question"}},{"kind":"Field","name":{"kind":"Name","value":"answer"}},{"kind":"Field","name":{"kind":"Name","value":"explanation"}},{"kind":"Field","name":{"kind":"Name","value":"timesReviewed"}},{"kind":"Field","name":{"kind":"Name","value":"correctAnswers"}},{"kind":"Field","name":{"kind":"Name","value":"incorrectAnswers"}},{"kind":"Field","name":{"kind":"Name","value":"successRate"}},{"kind":"Field","name":{"kind":"Name","value":"lastReviewedAt"}},{"kind":"Field","name":{"kind":"Name","value":"difficultyLevel"}},{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GroupFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ReviewFlashCardMutation, ReviewFlashCardMutationVariables>;
export const DeleteFlashCardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteFlashCard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeFlashCard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isDeleted"}}]}}]}}]} as unknown as DocumentNode<DeleteFlashCardMutation, DeleteFlashCardMutationVariables>;
export const GenerateFlashCardsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GenerateFlashCards"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prompt"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateAIFlashcards"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prompt"}}},{"kind":"Argument","name":{"kind":"Name","value":"groupId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"groupId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"question"}},{"kind":"Field","name":{"kind":"Name","value":"answer"}},{"kind":"Field","name":{"kind":"Name","value":"explanation"}}]}}]}}]} as unknown as DocumentNode<GenerateFlashCardsQuery, GenerateFlashCardsQueryVariables>;
export const WalletBalancePredictionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WalletBalancePrediction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"toDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"walletBalancePrediction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"toDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"toDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentBalance"}},{"kind":"Field","name":{"kind":"Name","value":"avgMonthlyIncome"}},{"kind":"Field","name":{"kind":"Name","value":"avgMonthlyExpense"}},{"kind":"Field","name":{"kind":"Name","value":"avgMonthlyNet"}},{"kind":"Field","name":{"kind":"Name","value":"historicalMonths"}},{"kind":"Field","name":{"kind":"Name","value":"projections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"monthsAhead"}},{"kind":"Field","name":{"kind":"Name","value":"projectedBalance"}},{"kind":"Field","name":{"kind":"Name","value":"avgMonthlyIncome"}},{"kind":"Field","name":{"kind":"Name","value":"avgMonthlyExpense"}},{"kind":"Field","name":{"kind":"Name","value":"avgMonthlyNet"}}]}}]}}]}}]} as unknown as DocumentNode<WalletBalancePredictionQuery, WalletBalancePredictionQueryVariables>;
export const GetNotificationSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetNotificationSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getNotificationSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isEnable"}},{"kind":"Field","name":{"kind":"Name","value":"enabledNotifications"}}]}}]}}]} as unknown as DocumentNode<GetNotificationSettingsQuery, GetNotificationSettingsQueryVariables>;
export const GetAvailableNotificationTypesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAvailableNotificationTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAvailableNotificationTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"schedule"}}]}}]}}]} as unknown as DocumentNode<GetAvailableNotificationTypesQuery, GetAvailableNotificationTypesQueryVariables>;
export const ToggleEnabledNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ToggleEnabledNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"toggleEnabledNotifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isEnable"}},{"kind":"Field","name":{"kind":"Name","value":"enabledNotifications"}}]}}]}}]} as unknown as DocumentNode<ToggleEnabledNotificationsMutation, ToggleEnabledNotificationsMutationVariables>;
export const HomeExtrasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HomeExtras"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"GetWalletFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"take"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"limits"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"range"},"value":{"kind":"StringValue","value":"monthly","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"current"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subscriptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"dateStart"}},{"kind":"Field","name":{"kind":"Name","value":"dateEnd"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"nextBillingDate"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}},{"kind":"Field","name":{"kind":"Name","value":"totalSpent"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"totalDuration"}}]}},{"kind":"Field","name":{"kind":"Name","value":"wallet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenses2"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"Variable","name":{"kind":"Name","value":"take"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"subscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<HomeExtrasQuery, HomeExtrasQueryVariables>;
export const HomeStatisticsDayOfWeekDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HomeStatisticsDayOfWeek"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statisticsDayOfWeek"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"day"}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<HomeStatisticsDayOfWeekQuery, HomeStatisticsDayOfWeekQueryVariables>;
export const HomeZeroSpendingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HomeZeroSpendings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statisticsZeroExpenseDays"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"days"}},{"kind":"Field","name":{"kind":"Name","value":"saved"}},{"kind":"Field","name":{"kind":"Name","value":"streak"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}}]}}]}}]} as unknown as DocumentNode<HomeZeroSpendingsQuery, HomeZeroSpendingsQueryVariables>;
export const GetMonthlyOccurrencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMonthlyOccurrences"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"occurrenceMonth"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}}]}}]}}]} as unknown as DocumentNode<GetMonthlyOccurrencesQuery, GetMonthlyOccurrencesQueryVariables>;
export const AddTodoFileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddTodoFile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddTodoFileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addTodoFile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]} as unknown as DocumentNode<AddTodoFileMutation, AddTodoFileMutationVariables>;
export const CompleteOccurrenceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteOccurrence"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CompleteOccurrenceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completeOccurrence"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}}]}}]}}]} as unknown as DocumentNode<CompleteOccurrenceMutation, CompleteOccurrenceMutationVariables>;
export const CompleteOccurrenceTodoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteOccurrenceTodo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CompleteOccurrenceTodoInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completeOccurrenceTodo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"modifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CompleteOccurrenceTodoMutation, CompleteOccurrenceTodoMutationVariables>;
export const CreateOccurrenceTodoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOccurrenceTodo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOccurrenceTodoInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOccurrenceTodo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"modifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"files"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<CreateOccurrenceTodoMutation, CreateOccurrenceTodoMutationVariables>;
export const DeleteOccurrenceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteOccurrence"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeleteOccurrenceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOccurrence"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<DeleteOccurrenceMutation, DeleteOccurrenceMutationVariables>;
export const EditOccurrenceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EditOccurrence"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EditOccurrenceArgsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"editOccurrence"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"seriesId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"beginTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"isAllDay"}},{"kind":"Field","name":{"kind":"Name","value":"isRepeat"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"reminderBeforeMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"todos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"modifiedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}}]} as unknown as DocumentNode<EditOccurrenceMutation, EditOccurrenceMutationVariables>;
export const CompleteOccurrenceTodoQuickDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteOccurrenceTodoQuick"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CompleteOccurrenceTodoInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completeOccurrenceTodo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"modifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CompleteOccurrenceTodoQuickMutation, CompleteOccurrenceTodoQuickMutationVariables>;
export const RemoveOccurrenceTodoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveOccurrenceTodo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeOccurrenceTodo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<RemoveOccurrenceTodoMutation, RemoveOccurrenceTodoMutationVariables>;
export const RemoveTodoFileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveTodoFile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fileId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeTodoFile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fileId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fileId"}}}]}]}}]} as unknown as DocumentNode<RemoveTodoFileMutation, RemoveTodoFileMutationVariables>;
export const TransferTodosDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TransferTodos"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TransferTodosInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transferTodos"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<TransferTodosMutation, TransferTodosMutationVariables>;
export const GetOccurrenceByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOccurrenceById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"occurrenceById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"seriesId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"beginTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"isSkipped"}},{"kind":"Field","name":{"kind":"Name","value":"isAllDay"}},{"kind":"Field","name":{"kind":"Name","value":"isRepeat"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"reminderBeforeMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"todos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"modifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"files"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetOccurrenceByIdQuery, GetOccurrenceByIdQueryVariables>;
export const GetOccurrencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOccurrences"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"occurrences"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"seriesId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"beginTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"isSkipped"}},{"kind":"Field","name":{"kind":"Name","value":"isRepeat"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"reminderBeforeMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"todos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<GetOccurrencesQuery, GetOccurrencesQueryVariables>;
export const GetCalendarOccurrencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCalendarOccurrences"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"occurrences"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"beginTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}}]}}]}}]} as unknown as DocumentNode<GetCalendarOccurrencesQuery, GetCalendarOccurrencesQueryVariables>;
export const GetMissedOccurrencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMissedOccurrences"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"OccurrenceFiltersInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"occurrences"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"seriesId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"beginTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"isSkipped"}},{"kind":"Field","name":{"kind":"Name","value":"isRepeat"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"reminderBeforeMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"todos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<GetMissedOccurrencesQuery, GetMissedOccurrencesQueryVariables>;
export const CreateEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateEventWithRepeatInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OccurrenceFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OccurrenceFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OccurrenceView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"seriesId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"beginTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"isSkipped"}},{"kind":"Field","name":{"kind":"Name","value":"isAllDay"}},{"kind":"Field","name":{"kind":"Name","value":"isRepeat"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"reminderBeforeMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"todos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"modifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"files"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateEventMutation, CreateEventMutationVariables>;
export const CopyOccurrenceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CopyOccurrence"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CopyOccurrenceArgsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"copyOccurrence"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OccurrenceFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OccurrenceFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OccurrenceView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"seriesId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"beginTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"isSkipped"}},{"kind":"Field","name":{"kind":"Name","value":"isAllDay"}},{"kind":"Field","name":{"kind":"Name","value":"isRepeat"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"reminderBeforeMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"todos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"modifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"files"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CopyOccurrenceMutation, CopyOccurrenceMutationVariables>;
export const GetOccurrenceTodoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOccurrenceTodo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"occurrenceTodo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"modifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"files"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<GetOccurrenceTodoQuery, GetOccurrenceTodoQueryVariables>;
export const CreateExpenseFormDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateExpenseForm"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateExpenseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]}}]} as unknown as DocumentNode<CreateExpenseFormMutation, CreateExpenseFormMutationVariables>;
export const EditExpenseFormDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EditExpenseForm"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EditExpenseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"editExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<EditExpenseFormMutation, EditExpenseFormMutationVariables>;
export const EditOccurrenceFormDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EditOccurrenceForm"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EditOccurrenceArgsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"editOccurrence"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"beginTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}}]}}]} as unknown as DocumentNode<EditOccurrenceFormMutation, EditOccurrenceFormMutationVariables>;
export const AiPhotoPredictionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AiPhotoPrediction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"image"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createExpenseFromImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"image"},"value":{"kind":"Variable","name":{"kind":"Name","value":"image"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"balanceBeforeInteraction"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"spontaneousRate"}},{"kind":"Field","name":{"kind":"Name","value":"subexpenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]}}]}}]} as unknown as DocumentNode<AiPhotoPredictionMutation, AiPhotoPredictionMutationVariables>;
export const GetExpenseSuggestionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetExpenseSuggestions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"GetWalletFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"take"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wallet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenses2"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"Variable","name":{"kind":"Name","value":"take"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetExpenseSuggestionsQuery, GetExpenseSuggestionsQueryVariables>;
export const SearchLocationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchLocations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}}]}}]} as unknown as DocumentNode<SearchLocationsQuery, SearchLocationsQueryVariables>;
export const CreateLocationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateLocation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateLocationDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createLocation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}}]}}]} as unknown as DocumentNode<CreateLocationMutation, CreateLocationMutationVariables>;
export const AddExpenseLocationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddExpenseLocation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddExpenseLocationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addExpenseLocation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<AddExpenseLocationMutation, AddExpenseLocationMutationVariables>;
export const GetMonthTotalDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getMonthTotal"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMonthTotal"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}}]}]}}]} as unknown as DocumentNode<GetMonthTotalQuery, GetMonthTotalQueryVariables>;
export const CreateWalletDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateWallet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"balance"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createWallet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"balance"},"value":{"kind":"Variable","name":{"kind":"Name","value":"balance"}}}]}]}}]} as unknown as DocumentNode<CreateWalletMutation, CreateWalletMutationVariables>;
export const LimitsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Limits"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"range"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"limits"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"range"},"value":{"kind":"Variable","name":{"kind":"Name","value":"range"}}},{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"current"}}]}}]}}]} as unknown as DocumentNode<LimitsQuery, LimitsQueryVariables>;
export const GetWalletLimitsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWalletLimits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wallet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"income"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyPercentageTarget"}}]}}]}}]} as unknown as DocumentNode<GetWalletLimitsQuery, GetWalletLimitsQueryVariables>;
export const WalletNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WalletNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"take"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"Variable","name":{"kind":"Name","value":"take"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"sendAt"}},{"kind":"Field","name":{"kind":"Name","value":"read"}}]}}]}}]} as unknown as DocumentNode<WalletNotificationsQuery, WalletNotificationsQueryVariables>;
export const ReadNotificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReadNotification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"readNotification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<ReadNotificationMutation, ReadNotificationMutationVariables>;
export const HourlySpendingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HourlySpendings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"months"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hourlySpendingsHeatMap"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"months"},"value":{"kind":"Variable","name":{"kind":"Name","value":"months"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hour"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"avg_amount"}},{"kind":"Field","name":{"kind":"Name","value":"min_amount"}},{"kind":"Field","name":{"kind":"Name","value":"max_amount"}},{"kind":"Field","name":{"kind":"Name","value":"std_deviation"}},{"kind":"Field","name":{"kind":"Name","value":"variance"}}]}}]}}]} as unknown as DocumentNode<HourlySpendingsQuery, HourlySpendingsQueryVariables>;
export const LimitsComparisonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LimitsComparison"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statisticsSpendingsLimits"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"totalSpent"}},{"kind":"Field","name":{"kind":"Name","value":"generalLimit"}},{"kind":"Field","name":{"kind":"Name","value":"generalLimitExceeded"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"spent"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"exceeded"}}]}}]}}]}}]} as unknown as DocumentNode<LimitsComparisonQuery, LimitsComparisonQueryVariables>;
export const MonthlyCategoryComparisonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MonthlyCategoryComparison"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"months"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"monthlyCategoryComparison"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"months"},"value":{"kind":"Variable","name":{"kind":"Name","value":"months"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"avg"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]}}]} as unknown as DocumentNode<MonthlyCategoryComparisonQuery, MonthlyCategoryComparisonQueryVariables>;
export const MonthlyDateSpendingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MonthlyDateSpendings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"months"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"monthlyDateSpendings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"months"},"value":{"kind":"Variable","name":{"kind":"Name","value":"months"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dayOfMonth"}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"averageAmount"}}]}}]}}]} as unknown as DocumentNode<MonthlyDateSpendingsQuery, MonthlyDateSpendingsQueryVariables>;
export const StatisticsDayOfWeekDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StatisticsDayOfWeek"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statisticsDayOfWeek"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"day"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"avg"}},{"kind":"Field","name":{"kind":"Name","value":"median"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<StatisticsDayOfWeekQuery, StatisticsDayOfWeekQueryVariables>;
export const PreviousStatisticsDayOfWeekDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PreviousStatisticsDayOfWeek"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statisticsDayOfWeek"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"day"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"avg"}},{"kind":"Field","name":{"kind":"Name","value":"median"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]} as unknown as DocumentNode<PreviousStatisticsDayOfWeekQuery, PreviousStatisticsDayOfWeekQueryVariables>;
export const GetZeroSpendingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetZeroSpendings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statisticsZeroExpenseDays"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"days"}},{"kind":"Field","name":{"kind":"Name","value":"avg"}},{"kind":"Field","name":{"kind":"Name","value":"streak"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"length"}}]}},{"kind":"Field","name":{"kind":"Name","value":"saved"}}]}}]}}]} as unknown as DocumentNode<GetZeroSpendingsQuery, GetZeroSpendingsQueryVariables>;
export const CorrectionMapsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CorrectionMaps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"correctionMaps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"matchShop"}},{"kind":"Field","name":{"kind":"Name","value":"matchDescription"}},{"kind":"Field","name":{"kind":"Name","value":"matchCategory"}},{"kind":"Field","name":{"kind":"Name","value":"matchAmountMin"}},{"kind":"Field","name":{"kind":"Name","value":"matchAmountMax"}},{"kind":"Field","name":{"kind":"Name","value":"overrideShop"}},{"kind":"Field","name":{"kind":"Name","value":"overrideCategory"}},{"kind":"Field","name":{"kind":"Name","value":"overrideDescription"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CorrectionMapsQuery, CorrectionMapsQueryVariables>;
export const CreateCorrectionMapDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCorrectionMap"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCorrectionMapDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCorrectionMap"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"matchShop"}},{"kind":"Field","name":{"kind":"Name","value":"matchDescription"}},{"kind":"Field","name":{"kind":"Name","value":"matchCategory"}},{"kind":"Field","name":{"kind":"Name","value":"matchAmountMin"}},{"kind":"Field","name":{"kind":"Name","value":"matchAmountMax"}},{"kind":"Field","name":{"kind":"Name","value":"overrideShop"}},{"kind":"Field","name":{"kind":"Name","value":"overrideCategory"}},{"kind":"Field","name":{"kind":"Name","value":"overrideDescription"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateCorrectionMapMutation, CreateCorrectionMapMutationVariables>;
export const UpdateCorrectionMapDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCorrectionMap"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCorrectionMapDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCorrectionMap"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"matchShop"}},{"kind":"Field","name":{"kind":"Name","value":"matchDescription"}},{"kind":"Field","name":{"kind":"Name","value":"matchCategory"}},{"kind":"Field","name":{"kind":"Name","value":"matchAmountMin"}},{"kind":"Field","name":{"kind":"Name","value":"matchAmountMax"}},{"kind":"Field","name":{"kind":"Name","value":"overrideShop"}},{"kind":"Field","name":{"kind":"Name","value":"overrideCategory"}},{"kind":"Field","name":{"kind":"Name","value":"overrideDescription"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<UpdateCorrectionMapMutation, UpdateCorrectionMapMutationVariables>;
export const DeleteCorrectionMapDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCorrectionMap"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCorrectionMap"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteCorrectionMapMutation, DeleteCorrectionMapMutationVariables>;
export const CreateExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateExpenseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"balanceBeforeInteraction"}},{"kind":"Field","name":{"kind":"Name","value":"schedule"}},{"kind":"Field","name":{"kind":"Name","value":"subscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"nextBillingDate"}},{"kind":"Field","name":{"kind":"Name","value":"dateStart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subexpenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}},{"kind":"Field","name":{"kind":"Name","value":"files"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<CreateExpenseMutation, CreateExpenseMutationVariables>;
export const DeleteActivityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteActivity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteActivityMutation, DeleteActivityMutationVariables>;
export const EditExpenseNoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EditExpenseNote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EditExpenseNoteInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"editExpenseNote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<EditExpenseNoteMutation, EditExpenseNoteMutationVariables>;
export const EditExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EditExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EditExpenseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"editExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<EditExpenseMutation, EditExpenseMutationVariables>;
export const EditBalanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EditBalance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EditWalletBalanceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"editWalletBalance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"income"}},{"kind":"Field","name":{"kind":"Name","value":"paycheckDate"}}]}}]}}]} as unknown as DocumentNode<EditBalanceMutation, EditBalanceMutationVariables>;
export const StatisticsLegendDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StatisticsLegend"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"detailed"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statisticsLegend"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"displayMode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"detailed"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"percentage"}}]}}]}}]} as unknown as DocumentNode<StatisticsLegendQuery, StatisticsLegendQueryVariables>;
export const WalletStatisticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WalletStatistics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"range"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"statistics"},"name":{"kind":"Name","value":"getStatistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"range"},"value":{"kind":"Variable","name":{"kind":"Name","value":"range"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"average"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"theMostCommonCategory"}},{"kind":"Field","name":{"kind":"Name","value":"theLeastCommonCategory"}},{"kind":"Field","name":{"kind":"Name","value":"lastBalance"}},{"kind":"Field","name":{"kind":"Name","value":"income"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}}]}}]}}]} as unknown as DocumentNode<WalletStatisticsQuery, WalletStatisticsQueryVariables>;
export const SubscriptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Subscriptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subscriptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"dateStart"}},{"kind":"Field","name":{"kind":"Name","value":"dateEnd"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"nextBillingDate"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}},{"kind":"Field","name":{"kind":"Name","value":"billingDay"}},{"kind":"Field","name":{"kind":"Name","value":"customBillingMonths"}},{"kind":"Field","name":{"kind":"Name","value":"reminderDaysBeforehand"}},{"kind":"Field","name":{"kind":"Name","value":"totalSpent"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"totalDuration"}},{"kind":"Field","name":{"kind":"Name","value":"expenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]}}]}}]} as unknown as DocumentNode<SubscriptionsQuery, SubscriptionsQueryVariables>;
export const GetWalletDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWallet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"GetWalletFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"take"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeFiles"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}},"defaultValue":{"kind":"BooleanValue","value":true}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeSubexpenses"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}},"defaultValue":{"kind":"BooleanValue","value":true}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeSubscription"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}},"defaultValue":{"kind":"BooleanValue","value":true}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeLocation"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}},"defaultValue":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wallet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"income"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyPercentageTarget"}},{"kind":"Field","name":{"kind":"Name","value":"expenses2"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"Variable","name":{"kind":"Name","value":"take"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"flow"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"income"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"spontaneousRate"}},{"kind":"Field","name":{"kind":"Name","value":"subAccountId"}},{"kind":"Field","name":{"kind":"Name","value":"subscription"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeSubscription"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"nextBillingDate"}},{"kind":"Field","name":{"kind":"Name","value":"dateStart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"location"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeLocation"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"files"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeFiles"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subexpenses"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeSubexpenses"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetWalletQuery, GetWalletQueryVariables>;
export const PredictExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PredictExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"predictExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"shop"}},{"kind":"Field","name":{"kind":"Name","value":"locationId"}},{"kind":"Field","name":{"kind":"Name","value":"confidence"}}]}}]}}]} as unknown as DocumentNode<PredictExpenseQuery, PredictExpenseQueryVariables>;
export const ReadAllNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReadAllNotifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"readAllNotifications"}}]}}]} as unknown as DocumentNode<ReadAllNotificationsMutation, ReadAllNotificationsMutationVariables>;
export const RefundExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"refundExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expenseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refundExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"expenseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expenseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<RefundExpenseMutation, RefundExpenseMutationVariables>;
export const SubAccountsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SubAccounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wallet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subAccounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"income"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}}]}}]}}]}}]} as unknown as DocumentNode<SubAccountsQuery, SubAccountsQueryVariables>;
export const CreateSubAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSubAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateSubAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSubAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}}]}}]}}]} as unknown as DocumentNode<CreateSubAccountMutation, CreateSubAccountMutationVariables>;
export const UpdateSubAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSubAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateSubAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSubAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}}]}}]}}]} as unknown as DocumentNode<UpdateSubAccountMutation, UpdateSubAccountMutationVariables>;
export const DeleteSubAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSubAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteSubAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteSubAccountMutation, DeleteSubAccountMutationVariables>;
export const TransferBetweenSubAccountsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TransferBetweenSubAccounts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TransferBetweenSubAccountsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transferBetweenSubAccounts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}}]}}]}}]} as unknown as DocumentNode<TransferBetweenSubAccountsMutation, TransferBetweenSubAccountsMutationVariables>;
export const ModifySubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"modifySubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateSubscriptionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"modifySubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"dateStart"}},{"kind":"Field","name":{"kind":"Name","value":"dateEnd"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"nextBillingDate"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}},{"kind":"Field","name":{"kind":"Name","value":"billingDay"}},{"kind":"Field","name":{"kind":"Name","value":"customBillingMonths"}},{"kind":"Field","name":{"kind":"Name","value":"reminderDaysBeforehand"}}]}}]}}]} as unknown as DocumentNode<ModifySubscriptionMutation, ModifySubscriptionMutationVariables>;
export const CancelSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"cancelSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"subscriptionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"balanceBeforeInteraction"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"subscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"nextBillingDate"}},{"kind":"Field","name":{"kind":"Name","value":"dateStart"}}]}}]}}]}}]} as unknown as DocumentNode<CancelSubscriptionMutation, CancelSubscriptionMutationVariables>;
export const CreateSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expenseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"expenseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expenseId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"balanceBeforeInteraction"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"subscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"nextBillingDate"}},{"kind":"Field","name":{"kind":"Name","value":"dateStart"}}]}}]}}]}}]} as unknown as DocumentNode<CreateSubscriptionMutation, CreateSubscriptionMutationVariables>;
export const CreateSubscriptionFromInputDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createSubscriptionFromInput"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateSubscriptionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"create"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"dateStart"}},{"kind":"Field","name":{"kind":"Name","value":"dateEnd"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"nextBillingDate"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}},{"kind":"Field","name":{"kind":"Name","value":"billingDay"}},{"kind":"Field","name":{"kind":"Name","value":"customBillingMonths"}},{"kind":"Field","name":{"kind":"Name","value":"reminderDaysBeforehand"}}]}}]}}]} as unknown as DocumentNode<CreateSubscriptionFromInputMutation, CreateSubscriptionFromInputMutationVariables>;
export const RenewSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"renewSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"renewSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"subscriptionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subscriptionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"balanceBeforeInteraction"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"subscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"nextBillingDate"}},{"kind":"Field","name":{"kind":"Name","value":"dateStart"}}]}}]}}]}}]} as unknown as DocumentNode<RenewSubscriptionMutation, RenewSubscriptionMutationVariables>;
export const AssignExpenseToSubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"assignExpenseToSubscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AssignExpenseToSubscriptionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignExpenseToSubscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"balanceBeforeInteraction"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"subscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"nextBillingDate"}},{"kind":"Field","name":{"kind":"Name","value":"dateStart"}}]}}]}}]}}]} as unknown as DocumentNode<AssignExpenseToSubscriptionMutation, AssignExpenseToSubscriptionMutationVariables>;
export const UploadSubExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UploadSubExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddMultipleSubExpensesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addMultipleSubExpenses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]}}]} as unknown as DocumentNode<UploadSubExpenseMutation, UploadSubExpenseMutationVariables>;
export const StatisticsAiChatDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StatisticsAiChat"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AiChatInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"aiChat"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AiChatMessageFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AiChatMessageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AiChatMessageItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"subtype"}}]}}]} as unknown as DocumentNode<StatisticsAiChatMutation, StatisticsAiChatMutationVariables>;
export const GetStatisticsAiChatHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetStatisticsAiChatHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"aiChatHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AiChatMessageFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AiChatMessageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AiChatMessageItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"subtype"}}]}}]} as unknown as DocumentNode<GetStatisticsAiChatHistoryQuery, GetStatisticsAiChatHistoryQueryVariables>;
export const CreateLimitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateLimit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateLimit"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createLimit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateLimitMutation, CreateLimitMutationVariables>;
export const ExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Expense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"expenseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ExpenseDetails"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expenseSimilar"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"expenseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ExpenseDetails"}}]}},{"kind":"Field","name":{"kind":"Name","value":"wallet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"income"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyPercentageTarget"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ExpenseDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ExpenseEntity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"balanceBeforeInteraction"}},{"kind":"Field","name":{"kind":"Name","value":"spontaneousRate"}},{"kind":"Field","name":{"kind":"Name","value":"subAccountId"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"subscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"nextBillingDate"}},{"kind":"Field","name":{"kind":"Name","value":"dateStart"}}]}},{"kind":"Field","name":{"kind":"Name","value":"location"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"latitude"}},{"kind":"Field","name":{"kind":"Name","value":"longitude"}}]}},{"kind":"Field","name":{"kind":"Name","value":"files"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subexpenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]}}]} as unknown as DocumentNode<ExpenseQuery, ExpenseQueryVariables>;
export const DeleteSubExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSubExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteSubExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteSubExpenseMutation, DeleteSubExpenseMutationVariables>;
export const GetExpensesForLimitsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetExpensesForLimits"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"GetWalletFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"take"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wallet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenses2"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"Variable","name":{"kind":"Name","value":"take"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetExpensesForLimitsQuery, GetExpensesForLimitsQueryVariables>;
export const SubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Subscription"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subscription"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"dateStart"}},{"kind":"Field","name":{"kind":"Name","value":"dateEnd"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"nextBillingDate"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}},{"kind":"Field","name":{"kind":"Name","value":"billingDay"}},{"kind":"Field","name":{"kind":"Name","value":"customBillingMonths"}},{"kind":"Field","name":{"kind":"Name","value":"reminderDaysBeforehand"}},{"kind":"Field","name":{"kind":"Name","value":"expenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"balanceBeforeInteraction"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]}}]}}]} as unknown as DocumentNode<SubscriptionQuery, SubscriptionQueryVariables>;
export const CreateNotificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createNotification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetNotificationsTokenInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setNotificationsToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<CreateNotificationMutation, CreateNotificationMutationVariables>;
export const RefreshTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]} as unknown as DocumentNode<RefreshTokenMutation, RefreshTokenMutationVariables>;
export const GetRootViewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRootView"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"range"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lastRange"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wallet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"income"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyPercentageTarget"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"monthlySpendings"},"name":{"kind":"Name","value":"getStatistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"range"},"value":{"kind":"Variable","name":{"kind":"Name","value":"range"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Stats"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"lastMonthSpendings"},"name":{"kind":"Name","value":"getStatistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"range"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lastRange"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Stats"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Stats"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WalletStatisticsRange"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"average"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"theMostCommonCategory"}},{"kind":"Field","name":{"kind":"Name","value":"theLeastCommonCategory"}},{"kind":"Field","name":{"kind":"Name","value":"lastBalance"}},{"kind":"Field","name":{"kind":"Name","value":"income"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}}]}}]} as unknown as DocumentNode<GetRootViewQuery, GetRootViewQueryVariables>;
export const AddExerciseProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddExerciseProgress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"exerciseId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sets"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reps"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"weight"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createExerciseProgress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"exerciseId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"exerciseId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"sets"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sets"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"reps"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reps"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"weight"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weight"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exerciseProgressId"}},{"kind":"Field","name":{"kind":"Name","value":"sets"}},{"kind":"Field","name":{"kind":"Name","value":"reps"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}}]}}]} as unknown as DocumentNode<AddExerciseProgressMutation, AddExerciseProgressMutationVariables>;
export const CompleteOccurrenceFromWidgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteOccurrenceFromWidget"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CompleteOccurrenceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completeOccurrence"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}}]}}]}}]} as unknown as DocumentNode<CompleteOccurrenceFromWidgetMutation, CompleteOccurrenceFromWidgetMutationVariables>;
export const CompleteOccurrenceTodoFromWidgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteOccurrenceTodoFromWidget"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CompleteOccurrenceTodoInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completeOccurrenceTodo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isCompleted"}}]}}]}}]} as unknown as DocumentNode<CompleteOccurrenceTodoFromWidgetMutation, CompleteOccurrenceTodoFromWidgetMutationVariables>;
export const WidgetAnalyticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WidgetAnalytics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"range"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"statsRange"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"detailed"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"limits"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"range"},"value":{"kind":"Variable","name":{"kind":"Name","value":"range"}}},{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"current"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"statistics"},"name":{"kind":"Name","value":"getStatistics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"range"},"value":{"kind":"Variable","name":{"kind":"Name","value":"statsRange"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"average"}},{"kind":"Field","name":{"kind":"Name","value":"max"}},{"kind":"Field","name":{"kind":"Name","value":"min"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"theMostCommonCategory"}},{"kind":"Field","name":{"kind":"Name","value":"theLeastCommonCategory"}},{"kind":"Field","name":{"kind":"Name","value":"lastBalance"}},{"kind":"Field","name":{"kind":"Name","value":"income"}},{"kind":"Field","name":{"kind":"Name","value":"expense"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statisticsDayOfWeek"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"day"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"avg"}},{"kind":"Field","name":{"kind":"Name","value":"median"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statisticsLegend"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"displayMode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"detailed"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"percentage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"wallet"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"income"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyPercentageTarget"}}]}}]}}]} as unknown as DocumentNode<WidgetAnalyticsQuery, WidgetAnalyticsQueryVariables>;
export const ExpensesLegendDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExpensesLegend"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"detailed"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statisticsLegend"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"displayMode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"detailed"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"percentage"}}]}}]}}]} as unknown as DocumentNode<ExpensesLegendQuery, ExpensesLegendQueryVariables>;