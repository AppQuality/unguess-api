import * as db from "@src/features/db";

interface bugsByUseCaseQueryResults {
  total: number;
  id: number;
  title: string;
  content: string;
  simple_title: string;
  info: string;
  prefix: string;
}

// UC allowed responses 12.5 | 37.5 | 62.5 | 87.5

const UC_PROGRESS_1 = { max: 25, value: 12.5 }; //  0%  - 24.99%
const UC_PROGRESS_2 = { max: 50, value: 37.5 }; //  25% - 49.99%
const UC_PROGRESS_3 = { max: 75, value: 62.5 }; //  50% - 74.99%
const UC_PROGRESS_4 = { max: 100, value: 87.5 }; // 75% - 100%

const getWidgetUseCaseProgress = async (
  cp: StoplightComponents["schemas"]["CampaignWithOutput"]
): Promise<number> => {
  // Selected testers
  const testersQuery = `SELECT 
    p.id, 
    c.group_id
    FROM wp_crowd_appq_has_candidate c
           JOIN wp_appq_evd_profile p ON (p.wp_user_id = c.user_id)
    WHERE c.campaign_id = ?
    AND accepted = 1 GROUP BY p.id`;

  const testers = await db.query(db.format(testersQuery, [cp.id]));

  if (!testers.length) {
    return 0;
  }

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

  const uc = await db.query(db.format(ucQuery, [cp.id]));

  if (!uc.length) {
    return UC_PROGRESS_1.value;
  }

  const completion = {
    expected: 0,
    actual: 0,
  };

  uc.forEach((useCase: { group_id: number; completions: number }) => {
    completion.expected += groups[useCase.group_id];
    completion.actual += useCase.completions;
  });

  if (completion.expected === 0 || completion.actual === 0)
    return UC_PROGRESS_1.value;

  const progress = (completion.actual / completion.expected) * 100;

  if (progress < UC_PROGRESS_1.max) return UC_PROGRESS_1.value;
  else if (progress < UC_PROGRESS_2.max) return UC_PROGRESS_2.value;
  else if (progress < UC_PROGRESS_3.max) return UC_PROGRESS_3.value;
  else return UC_PROGRESS_4.value;
};

export const getWidgetCampaignProgress = async (
  campaign: StoplightComponents["schemas"]["CampaignWithOutput"]
): Promise<
  StoplightComponents["schemas"]["WidgetCampaignProgress"] & {
    kind: "campaignProgress";
  }
> => {
  const error = {
    code: 400,
    message: "Something went wrong with campaign-progress widget",
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  const useCaseProgress = await getWidgetUseCaseProgress(campaign);

  const startDate = new Date(campaign.start_date);
  const endDate = new Date(campaign.end_date);
  const now = new Date();

  const expDuration = endDate.getTime() - startDate.getTime();
  const actDuration = now.getTime() - startDate.getTime();

  return {
    data: [
      {
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        usecase_completion: useCaseProgress,
        time_elapsed: actDuration,
        expected_duration: expDuration,
      },
    ],
    kind: "campaignProgress",
  } as StoplightComponents["schemas"]["WidgetCampaignProgress"] & {
    kind: "campaignProgress";
  };
};
