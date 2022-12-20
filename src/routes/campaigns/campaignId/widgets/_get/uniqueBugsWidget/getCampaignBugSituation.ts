import * as db from "@src/features/db";

async function getCampaignBugSituation(campaign: {
  id: number;
  showNeedReview: boolean;
}) {
  const bugs = await db.query(
    db.format(
      `SELECT is_duplicated FROM wp_appq_evd_bug 
            WHERE campaign_id = ?  
            AND publish = 1
            AND ${
              campaign.showNeedReview
                ? "(status_id = 2 OR status_id = 4)"
                : "status_id = 2"
            } 
            `,
      [campaign.id]
    )
  );

  const unique = bugs.filter(
    (bug: { is_duplicated: 1 | 0 }) => bug.is_duplicated != 1
  );
  return { unique: unique.length, total: bugs.length };
}

export default getCampaignBugSituation;
