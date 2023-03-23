export function yyyymmdd(s: string): string {
  return new Date(s).toISOString().split("T")[0];
}
