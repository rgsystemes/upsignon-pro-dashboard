// NB use ISO string dates because they can be compared alphabetically
export const getDaysArray = (startDay: string, endDay: string): string[] => {
  const current = new Date(startDay);
  current.setHours(0, 0, 0, 0); // make sur time date is set in ISO standard
  const end = new Date(endDay);
  const res = [];
  let hasNextDate = true;
  while (hasNextDate) {
    res.push(current.toISOString());
    current.setDate(current.getDate() + 1);
    hasNextDate = current.getTime() < end.getTime();
  }
  return res;
};
