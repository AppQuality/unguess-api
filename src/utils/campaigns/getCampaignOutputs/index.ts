import * as db from "@src/features/db";

export const getCampaignOutputs = async ({
  campaignId,
}: {
  campaignId: number;
}): Promise<StoplightComponents["schemas"]["Output"][]> => {
  let availableOutputs = [] as StoplightComponents["schemas"]["Output"][];

  // This campaign has bugs?
  const hasBugs = await db.query(
    db.format(`SELECT id FROM wp_appq_evd_bug WHERE campaign_id = ? LIMIT 1`, [
      campaignId,
    ])
  );

  if (hasBugs.length > 0) {
    availableOutputs.push("bugs");
  }

  // This campaign has media?
  const hasMedia = await db.query(
    db.format(
      `SELECT t.id FROM wp_appq_user_task_media m JOIN wp_appq_campaign_task t ON (m.campaign_task_id = t.id) WHERE t.campaign_id = ? LIMIT 1`,
      [campaignId]
    )
  );

  if (hasMedia.length > 0) {
    availableOutputs.push("media");
  }

  return availableOutputs;
};
