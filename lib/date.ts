/**
 * 将 "YYYY-MM-DD" 解析为本地时区的 Date。
 * `new Date("YYYY-MM-DD")` 会按 UTC 解析，在负时区会得到前一天；
 * 这里改为按本地年月日构造。带时间的 ISO 字符串回退到原生解析。
 */
export function parseLocalDate(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return new Date(iso);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}
