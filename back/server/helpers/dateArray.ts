// Returns [2023-01-12, 2023-01-13, 2023-01-14, ..., until current date]
// NB use ISO string dates because they can be compared alphabetically
export const getDaysArray = (startDay: string): string[] => {
  const [year, month, day] = startDay.split('-').map(Number);
  const current = new Date(Date.UTC(year, month - 1, day));
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const res = [];
  let hasNextDate = true;
  while (hasNextDate) {
    res.push(current.toISOString().split('T')[0]);
    current.setUTCDate(current.getUTCDate() + 1);
    hasNextDate = current.getTime() <= end.getTime();
  }
  return res;
};
