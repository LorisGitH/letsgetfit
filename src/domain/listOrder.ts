/** The selected items in the order of the fixed list they come from, without duplicates. */
export function inListOrder<Item>(
  list: readonly Item[],
  selected: readonly Item[],
): Item[] {
  return list.filter((item) => selected.includes(item));
}
