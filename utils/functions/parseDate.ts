import moment from "moment";

export const DATE_FORMAT = "YYYY-MM-DD";

export function parseDate(date: string | number) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDate(date: Date = new Date()) {
  return moment(date).format(DATE_FORMAT);
}
