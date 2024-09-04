export const CommonEvents = [
  {
    name: "Shopping list",
    content: "Create a shopping list",
    autoCreate: true,
  },
  {
    name: "Working out - Gym",
    content: "Exercise for at least 60 minutes",
    categories: ["FBW", "Home workout", "With working module", "Cardio"],
  },
  {
    name: "Shopping",
    content: "Buy groceries and essentials",
    //prettier-ignore
    categories: [
      'Electronics', 'Books', 'Food', 'Essentials', 'Cleaning', 'School Stuff', ''
    ],
  },
  {
    name: "Work meeting",
    content: "Attend a scheduled meeting",
    categories: [],
  },
  {
    name: "Studying",
    content: "Dedicate time for learning and studying",
    // prettier-ignore
    categories: [
      'Matura', 'Biology', 'IT', 'Math', 'English', 'Polish', 'German', 'Different'
    ],
  },
  {
    name: "Work",
    content: "Complete tasks and projects at work",
    categories: [],
  },
  {
    name: "Relaxation",
    content: "Take some time to relax and unwind",
    categories: [],
  },
  {
    name: "Meal Prep",
    content: "Prepare meals for the day or week",
    categories: [],
  },
  {
    name: "Appointment",
    content: "Attend a scheduled appointment",
    categories: [],
  },
  {
    name: "Friends meeting",
    content: "Interact with friends or family",
    //prettier-ignore
    categories: ["Hause party", "Going out", "Cinema & Culture", "Games", "Food & Drinks"],
  },
  { name: "Sleep", content: "Ensure sufficient sleep duration" },
  {
    name: "Hobby",
    content: "Engage in a favorite hobby or activity",
    //prettier-ignore
    categories: ["Reading books", "Playing games", "Working out", 'Making food', 'Coding'],
  },
  {
    name: "Reflection",
    content: "Reflect on the day or set goals",
    categories: [],
  },
] as const;
