import * as db from "@src/features/db";

async function updateTrend({
  campaignId,
  userId,
  unique,
}: {
  campaignId: number;
  userId: number;
  unique: number;
}) {
  const trend = await db.query(
    db.format(
      `SELECT bugs_read 
                FROM wp_appq_unique_bug_read 
                WHERE campaign_id = ? AND wp_user_id = ?
              `,
      [campaignId, userId]
    ),
    "unguess"
  );
  const now = new Date().getTime().toString();
  if (trend.length > 0) {
    await db.query(
      db.format(
        `UPDATE wp_appq_unique_bug_read 
                    SET bugs_read = ? , update_time = ?
                    WHERE campaign_id = ? AND wp_user_id = ?
                  `,
        [unique, now, campaignId, userId]
      ),
      "unguess"
    );
  } else {
    await db.query(
      db.format(
        `INSERT INTO wp_appq_unique_bug_read 
                    (bugs_read, update_time, campaign_id, wp_user_id) 
                    VALUES (?, ?, ?, ?)
                  `,
        [unique, now, campaignId, userId]
      ),
      "unguess"
    );
  }
}

export default updateTrend;
