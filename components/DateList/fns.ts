import moment from "moment";

export type Date = {
  date: string;
  dayName: string;
  dayNumber: number;
};

export function createFutureDates(from: string, limit: number) {
  const futureDates = [] as Date[];
  const startDate = from ? moment(from).add(1, "days") : moment();

  for (let i = 0; i < limit; i++) {
    const futureDate = startDate.clone().add(i, "days");
    futureDates.push({
      dayName: moment.weekdays()[futureDate.weekday()],
      dayNumber: futureDate.date(),
      date: futureDate.format("YYYY-MM-DD"),
    });
  }

  return futureDates;
}

export function createPreviousDates(from: string, limit: number) {}

export function createDates(startDate?: string) {
  const currentDate = startDate ? moment(startDate) : moment();

  const previousDates = [] as Date[];
  for (let i = 1; i <= 5; i++) {
    const previousDate = currentDate.clone().subtract(i, "days");

    previousDates.push({
      dayName: moment.weekdays()[previousDate.weekday()],
      dayNumber: previousDate.date(),
      date: previousDate.format("YYYY-MM-DD"),
    });
  }

  const ongoingDates = [] as Date[];
  for (let i = 0; i < 5; i++) {
    const ongoingDate = currentDate.clone().add(i, "days");
    ongoingDates.push({
      dayName: moment.weekdays()[ongoingDate.weekday()],
      dayNumber: ongoingDate.date(),
      date: ongoingDate.format("YYYY-MM-DD"),
    });
  }

  return [...previousDates.reverse(), ...ongoingDates];
}
