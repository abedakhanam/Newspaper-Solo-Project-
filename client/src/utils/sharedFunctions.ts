export function capitalizeWords(str: string): string {
  return str
    .split(" ") // Split the string into words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
    .join(" "); // Join the words back together
}

export function formatDateString(isoString: string): string {
  const timezoneOffset = 6; // GMT+6
  const date = new Date(isoString);

  // Adjust the time to the GMT+6 timezone
  const localTime = new Date(date.getTime() + timezoneOffset * 60 * 60 * 1000);

  // Get the hours and minutes in 12-hour format
  let hours = localTime.getUTCHours();
  const minutes = localTime.getUTCMinutes();
  const ampm = hours >= 12 ? "p.m." : "a.m.";
  hours = hours % 12 === 0 ? 12 : hours % 12;

  // Format time
  const formattedTime = `${hours}:${minutes
    .toString()
    .padStart(2, "0")} ${ampm}`;

  // Format date (e.g., Oct. 2, 2024)
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  const formattedDate = localTime.toLocaleDateString("en-US", options);

  // Return the final formatted string
  return `${formattedTime} ${formattedDate}`;
}
