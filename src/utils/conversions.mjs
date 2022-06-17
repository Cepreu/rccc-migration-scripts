export function yyyymmdd(s) {
  return new Date(s).toISOString().split("T")[0];
}
