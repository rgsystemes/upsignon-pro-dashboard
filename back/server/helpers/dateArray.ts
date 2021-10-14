// NB use ISO string dates because they can be compared alphabetically
export const getDaysArray = (startDay: string, endDay: string): string[] => {
  const current = new Date(startDay);
  const end = new Date(endDay);
  const res = [current.toISOString()];
  while (current.getTime() < end.getTime()) {
    current.setDate(current.getDate() + 1);
    res.push(current.toISOString());
  }
  return res;
};
