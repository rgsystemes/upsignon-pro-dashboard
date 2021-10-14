import { db } from '../helpers/connection';

const getDaysArray = (startDay: string, endDay: string): Date[] => {
  const current = new Date(startDay);
  const end = new Date(endDay);
  const res = [new Date(current)];
  while (current.getTime() < end.getTime()) {
    current.setDate(current.getDate() + 1);
    res.push(new Date(current));
  }
  return res;
};

export const get_usage_stats = async (req: any, res: any): Promise<void> => {
  try {
    const rawStats = await db.query(
      "SELECT SUM(1) AS nb_users, date_trunc('day', created_at) as day  FROM users GROUP BY day ORDER BY day ASC",
    );

    // Then get the continuous list of days
    const days = getDaysArray(rawStats.rows[0].day, rawStats.rows[rawStats.rowCount - 1].day);

    let lastStatIndex = 0;
    let lastNbUsers = 0;
    const usageStats = days.map((d: Date) => {
      const row = rawStats.rows[lastStatIndex];
      if (row && new Date(row.day).getTime() === d.getTime()) {
        lastNbUsers += parseInt(row.nb_users);
        lastStatIndex++;
      }
      return { day: d.toISOString(), nbUsers: lastNbUsers };
    });

    res.status(200).send(usageStats);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
