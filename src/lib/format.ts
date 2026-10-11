// Ghost stores dates at midnight UTC for posts published "on a day"; format
// in UTC so the day doesn't shift with the server's or visitor's time zone.
export function formatDate(iso: string, month: "short" | "long" = "short") {
  return new Date(iso).toLocaleDateString("en", { year: "numeric", month, day: "numeric", timeZone: "UTC" });
}
