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

export const getWidgetBugsByUseCase = async (
  campaign: StoplightComponents["schemas"]["CampaignWithOutput"]
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

  const allowedStatuses = "2, 4"; // TODO: get status ids from config

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
      LEFT JOIN wp_appq_campaign_task t ON (t.id = b.application_section_id)
    where
      b.campaign_id = ?
      AND b.is_duplicated = 0
      AND b.status_id IN (${allowedStatuses})
    group by
      t.id
    ORDER BY
      total DESC;`;

  const result = await db.query(db.format(query, [campaign.id]));

  if (!result) {
    throw {
      ...error,
      code: 401,
      message: "No bugs found for this campaign",
    };
  }

  const useCasesWithBugs = result.map((row: bugsByUseCaseQueryResults) => ({
    usecase_id: row.id ?? -1,
    title:
      row.simple_title && row.simple_title.length
        ? row.simple_title
        : row.title || "Not a specific use case",
    description: row.content ?? "",
    bugs: row.total,
  }));

  return {
    data: useCasesWithBugs,
    kind: "bugsByUseCase",
  } as StoplightComponents["schemas"]["WidgetBugsByUseCase"];
};
