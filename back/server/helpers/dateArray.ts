// Returns [2023-01-12, 2023-01-13, 2023-01-14, ..., until current date]
// NB use ISO string dates because they can be compared alphabetically
export const getDaysArray = (startDay: string): string[] => {
  const current = new Date(startDay);
  const end = new Date();
  const res = [];
  let hasNextDate = true;
  while (hasNextDate) {
    res.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
    hasNextDate = current.getTime() < end.getTime();
  }
  return res;
};
