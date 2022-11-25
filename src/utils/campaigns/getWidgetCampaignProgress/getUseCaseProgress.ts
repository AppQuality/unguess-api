import * as db from "@src/features/db";

interface UseCaseProgress {
  groups: { [x: number]: number };
  usecases: {
    id: number;
    group_id: number;
    campaign_id: number;
    completions: number;
  }[];
}

export const getUseCaseProgress = async (
  campaign_id: number
): Promise<UseCaseProgress> => {
  const testersQuery = `SELECT 
      p.id, 
      c.group_id
      FROM wp_crowd_appq_has_candidate c
             JOIN wp_appq_evd_profile p ON (p.wp_user_id = c.user_id)
      WHERE c.campaign_id = ?
      AND accepted = 1 GROUP BY p.id`;

  const testers = await db.query(db.format(testersQuery, [campaign_id]));

  const defaultGroups = {
    0: 0, // All
    1: 0, // Group 1
    2: 0, // Group 2
    3: 0, // Group 3
    4: 0, // Group 4
  };

  // reduce tester to group
  const groups = testers.reduce(
    (
      acc: { [x: number]: number },
      tester: { id: number; group_id: number }
    ) => {
      acc[0] += 1; // Every tester is in the all group

      if (!acc[tester.group_id]) {
        acc[tester.group_id] = 1;
      } else {
        acc[tester.group_id] += 1;
      }
      return acc;
    },
    defaultGroups
  );

  // Use cases status
  const ucQuery = `SELECT 
      uc.id, 
      g.group_id, 
      uc.campaign_id, 
      COUNT(DISTINCT t.tester_id) as completions
      FROM wp_appq_campaign_task uc
        LEFT JOIN wp_appq_user_task t ON (t.task_id = uc.id AND t.is_completed = 1)
        JOIN wp_appq_campaign_task_group g ON (g.task_id = uc.id)
      WHERE uc.campaign_id = ?
      group by uc.id`;

  const uc = await db.query(db.format(ucQuery, [campaign_id]));

  return {
    groups,
    usecases: uc,
  };
};
