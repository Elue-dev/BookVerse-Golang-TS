export function formatDate(datestring: string) {
  const date = new Date(datestring);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";

  const formattedDateTime = `${day} ${month}, ${year} at ${
    hours % 12
  }:${minutes}${ampm}`;
  return formattedDateTime;
}
