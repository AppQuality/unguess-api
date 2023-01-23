import * as db from "@src/features/db";
import { formatUseCaseProgress } from "../getWidgetCampaignProgress/formatProgress";
import {
  getUseCaseProgress,
  UseCaseProgress,
} from "../getWidgetCampaignProgress/getUseCaseProgress";

interface bugsByUseCaseQueryResults {
  total: number;
  id: number;
  group_id: number;
  title: string;
  content: string;
  simple_title: string;
  info: string;
  prefix: string;
}

export const getSingleUseCaseCompletion = ({
  progress,
  usecase_id,
}: {
  progress: UseCaseProgress;
  usecase_id: number;
}) => {
  const { groups, usecases } = progress;

  if (!usecases.length || !groups[0]) {
    return formatUseCaseProgress();
  }

  const usecase = usecases.filter(
    (useCase: { id: number; completions: number }) => useCase.id === usecase_id
  );

  if (!usecase.length) {
    return formatUseCaseProgress();
  }

  /*
   * Even when a usecase is associated to multiple groups,
   * the completion is calculated as the number of entries in user_task table.
   */
  const completions = usecase[0].completions;

  const expectedCompletions = usecase.reduce(
    (acc: number, useCase: { group_id: number }) => {
      if (useCase.group_id in groups) {
        acc += groups[useCase.group_id];
      }
      return acc;
    },
    0
  );

  return formatUseCaseProgress((completions / expectedCompletions) * 100);
};

export const getWidgetBugsByUseCase = async (
  campaign: StoplightComponents["schemas"]["CampaignWithOutput"] & {
    showNeedReview: boolean;
  }
): Promise<StoplightComponents["schemas"]["WidgetBugsByUseCase"]> => {
  const error = {
    code: 400,
    message: "Something went wrong with bugs-by-use-case widget",
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  // Widget requires bugs output
  if (!campaign.outputs || !campaign.outputs.includes("bugs")) {
    throw error;
  }

  const query = `SELECT
      count(b.id) as total,
      t.id,
      t.title,
      t.content,
      t.simple_title,
      t.info,
      t.prefix
    from
      wp_appq_evd_bug b
      JOIN wp_appq_evd_bug_status status ON (b.status_id = status.id) 
      LEFT JOIN wp_appq_campaign_task t ON (t.id = b.application_section_id)
    where
      b.campaign_id = ?
      AND b.publish = 1
      AND b.is_duplicated = 0
      AND ${
        campaign.showNeedReview
          ? `(status.name = 'Approved' OR status.name = 'Need Review')`
          : `status.name = 'Approved'`
      }
    group by
      t.id
    ORDER BY
      total DESC, t.position ASC;`;

  const result = await db.query(db.format(query, [campaign.id]));

  if (!result) {
    throw {
      ...error,
      code: 401,
      message: "No bugs found for this campaign",
    };
  }

  const progress = await getUseCaseProgress(campaign.id);

  const useCasesWithBugs = result.map((row: bugsByUseCaseQueryResults) => ({
    usecase_id: row.id ?? -1,
    title: {
      full: row.title || "Not a specific use case",
      simple:
        row.simple_title && row.simple_title.length
          ? row.simple_title
          : undefined,
    },
    description: row.content ?? "",
    bugs: row.total,
    ...(row.id && {
      usecase_completion: getSingleUseCaseCompletion({
        progress,
        usecase_id: row.id,
      }),
    }),
  }));

  return {
    data: useCasesWithBugs,
    kind: "bugsByUseCase",
  } as StoplightComponents["schemas"]["WidgetBugsByUseCase"];
};
