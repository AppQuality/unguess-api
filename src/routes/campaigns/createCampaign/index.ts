import * as db from "@src/features/db";
import { getCampaignStatus } from "@src/routes/shared";

const DEFAULT_PLATFORM_ID = 0;

export default async (
  campaign_request: StoplightComponents["requestBodies"]["Campaign"]["content"]["application/json"]
): Promise<StoplightComponents["schemas"]["Campaign"]> => {
  // Define fields to be updated
  let campaign_fields = [
    "start_date",
    "end_date",
    "close_date",
    "title",
    "customer_title",
    "status_id",
    "is_public",
    "campaign_type_id",
    "project_id",
    "page_preview_id",
    "page_manual_id",
    "customer_id",
    "pm_id",
    "platform_id", //Required for db, but useless.
  ];

  // Define values from request body
  let campaign_values = [
    campaign_request.start_date as string,
    campaign_request.end_date as string,
    campaign_request.close_date as string,
    campaign_request.title as string,
    campaign_request.customer_title as string,
    campaign_request.status_id as number,
    campaign_request.is_public as number,
    campaign_request.campaign_type_id as number,
    campaign_request.project_id as number,
    campaign_request.page_preview_id as number,
    campaign_request.page_manual_id as number,
    campaign_request.customer_id as number,
    campaign_request.pm_id as number,
    DEFAULT_PLATFORM_ID,
  ];

  let insert_sql =
    `INSERT INTO wp_appq_evd_campaign (` +
    campaign_fields.join(",") +
    `) VALUES (${campaign_values.map((value) =>
      typeof value === "string" ? "'" + value + "'" : value
    )})`;
  let insert_result = await db.query(insert_sql);

  let cp_id;
  if (insert_result.insertId) {
    // MySql
    cp_id = insert_result.insertId;
  } else if (insert_result.lastInsertRowid) {
    // Sqlite
    cp_id = insert_result.lastInsertRowid;
  }

  let campaign = await db.query(
    db.format(
      `SELECT 
            c.id,  
            c.start_date,  
            c.end_date,
            c.close_date,
            c.title,
            c.customer_title,
            c.status_id,
            c.is_public,
            c.campaign_type_id,
            c.project_id,
            c.customer_id,
            ct.name AS campaign_type_name,
            ct.type AS test_type_id,
            p.display_name 
            FROM wp_appq_evd_campaign c 
            JOIN wp_appq_project p ON c.project_id = p.id 
            JOIN wp_appq_campaign_type ct ON c.campaign_type_id = ct.id
            WHERE c.id = ?`,
      [cp_id]
    )
  );

  campaign = campaign[0];

  return {
    id: campaign.id,
    start_date: campaign.start_date.toString(),
    end_date: campaign.end_date.toString(),
    close_date: campaign.close_date.toString(),
    title: campaign.title,
    customer_title: campaign.customer_title,
    status_id: campaign.status_id,
    status_name: getCampaignStatus(campaign),
    is_public: campaign.is_public,
    campaign_type_id: campaign.campaign_type_id,
    campaign_type_name: campaign.campaign_type_name,
    test_type_name: campaign.test_type_id === 1 ? "Functional" : "Experiential",
    project_id: campaign.project_id,
    project_name: campaign.display_name,
  };
};
