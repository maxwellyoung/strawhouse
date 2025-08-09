export function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateRange(start?: string, end?: string): string {
  const startStr = formatDate(start);
  const endStr = end ? formatDate(end) : "";
  return endStr ? `${startStr} — ${endStr}` : startStr;
}
