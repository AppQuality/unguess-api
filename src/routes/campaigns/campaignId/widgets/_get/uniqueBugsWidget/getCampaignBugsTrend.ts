import * as db from "@src/features/db";

async function getCampaignBugsTrend({
  campaignId,
  userId,
  unique,
}: {
  campaignId: number;
  userId: number;
  unique: number;
}) {
  const lastReadBugs = await db.query(
    db.format(
      `SELECT bugs_read 
                FROM wp_appq_unique_bug_read 
                WHERE campaign_id = ? AND wp_user_id = ?
              `,
      [campaignId, userId]
    ),
    "unguess"
  );
  let trend = unique;
  if (lastReadBugs.length > 0) {
    trend = trend - lastReadBugs[0].bugs_read;
  }
  return trend;
}

export default getCampaignBugsTrend;
