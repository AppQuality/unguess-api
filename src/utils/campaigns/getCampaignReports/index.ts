import * as db from "@src/features/db";

export const getCampaignReports = async (
  cp_id: number
): Promise<StoplightComponents["schemas"]["Report"][] | false> => {
  const results = await db.query(
    db.format(`SELECT * FROM wp_appq_report WHERE campaign_id = ?`, [cp_id])
  );

  // Format reports
  const reports = results.map((report: any) => {
    return {
      id: report.id,
      title: report.title,
      description: report.description,
      campaign_id: report.campaign_id,
      uploader_id: report.uploader_id,
      url: report.url,
      creation_date: report.creation_date,
      ...(report.update_date && { update_date: report.update_date }),
    };
  });

  return reports ?? false;
};
