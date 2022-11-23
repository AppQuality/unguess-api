import * as db from "@src/features/db";
export default async ({
  campaignId,
  userId,
}: {
  campaignId: number;
  userId: number;
}) => {
  const result = await db.query(
    db.format(
      `SELECT update_time
      FROM wp_appq_unique_bug_read
      WHERE campaign_id = ? AND wp_user_id = ?
    `,
      [campaignId, userId]
    ),
    "unguess"
  );
  if (result.length === 0) {
    return true;
  }

  const now = new Date();
  const lastUpdate = new Date(result[0].update_time);

  return now.getTime() - lastUpdate.getTime() > 60000;
};
