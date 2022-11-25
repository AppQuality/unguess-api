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

const getSingleUseCaseCompletion = ({
  progress,
  usecase_id,
  group_id,
}: {
  progress: UseCaseProgress;
  usecase_id: number;
  group_id: number;
}) => {
  const { groups, usecases } = progress;

  if (!usecases.length || !groups[0] || !groups[group_id]) {
    return formatUseCaseProgress();
  }

  const usecase = usecases.find(
    (useCase: { id: number; completions: number }) => useCase.id === usecase_id
  );

  if (!usecase || !usecase.completions) {
    return formatUseCaseProgress();
  }

  return formatUseCaseProgress((usecase.completions / groups[group_id]) * 100);
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
      t.group_id,
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
    title:
      row.simple_title && row.simple_title.length
        ? row.simple_title
        : row.title || "Not a specific use case",
    description: row.content ?? "",
    bugs: row.total,
    ...(row.id && {
      usecase_completion: getSingleUseCaseCompletion({
        progress,
        usecase_id: row.id,
        group_id: row.group_id,
      }),
    }),
  }));

  return {
    data: useCasesWithBugs,
    kind: "bugsByUseCase",
  } as StoplightComponents["schemas"]["WidgetBugsByUseCase"];
};
