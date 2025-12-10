// src/lib/utils.ts
export const cn = (
  ...values: Array<string | number | false | null | undefined>
): string => values.filter(Boolean).join(" ");
