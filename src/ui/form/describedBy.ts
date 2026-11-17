/** Joins the ids of whichever description elements are shown, for `aria-describedby`. */
export function describedBy(
  ...ids: (string | false | undefined)[]
): string | undefined {
  const shown = ids.filter(
    (id): id is string => typeof id === 'string' && id !== '',
  );
  return shown.length > 0 ? shown.join(' ') : undefined;
}
