import * as db from "@src/features/db";
import { getCampaignType } from "../getCampaignType";
import { getCampaignStatus } from "../getCampaignStatus";
import { getCampaignFamily } from "../getCampaignFamily";

const DEFAULT_PLATFORM_ID = 0;

export const createCampaign = async (
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
    "campaign_type",
    "customer_id",
    "pm_id",
    "platform_id", //Required for db, but useless.
    "form_factor",
    "os",
    "description", //Required for db, but useless.
    "base_bug_internal_id",
  ];

  // Get bug form
  let bug_form = -1;
  if (
    typeof campaign_request.has_bug_form !== undefined &&
    typeof campaign_request.has_bug_parade !== undefined
  ) {
    let bug_form_result = await getCampaignType({
      has_bug_form: campaign_request.has_bug_form,
      has_bug_parade: campaign_request.has_bug_parade,
    });
    if (bug_form_result !== false) bug_form = bug_form_result;
  }

  // Get request platforms form_factor and os
  let platforms = campaign_request.platforms;
  let form_factor_list = Array<Number>();
  let os_list = Array<Number>();
  if (platforms) {
    form_factor_list = [
      ...new Set(platforms.map((platform) => platform.deviceType)),
    ];
    os_list = platforms.map((platform) => platform.id);
  }

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
    bug_form as number,
    campaign_request.customer_id as number,
    campaign_request.pm_id as number,
    DEFAULT_PLATFORM_ID as number,
    form_factor_list.join(",") as string,
    os_list.join(",") as string,
    campaign_request.description as string,
    campaign_request.base_bug_internal_id as string,
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
            c.description,
            c.base_bug_internal_id,
            c.customer_title,
            c.status_id,
            c.is_public,
            c.campaign_type_id,
            c.project_id,
            cu.id AS customer_id,
            cu.company AS customer_name,
            c.campaign_type AS bug_form,
            ct.name AS campaign_type_name,
            ct.type AS campaign_family_id,
            p.display_name 
            FROM wp_appq_evd_campaign c 
            JOIN wp_appq_project p ON c.project_id = p.id 
            JOIN wp_appq_customer cu ON p.customer_id = cu.id 
            JOIN wp_appq_campaign_type ct ON c.campaign_type_id = ct.id
            WHERE c.id = ?`,
      [cp_id]
    )
  );

  campaign = campaign[0];

  // Get campaign family
  const campaign_family = getCampaignFamily({
    familyId: campaign.campaign_family_id,
  });

  return {
    id: campaign.id,
    start_date: campaign.start_date.toString(),
    end_date: campaign.end_date.toString(),
    close_date: campaign.close_date.toString(),
    title: campaign.title,
    customer_title: campaign.customer_title,
    is_public: campaign.is_public,
    bug_form: campaign.bug_form,
    type: {
      id: campaign.campaign_type_id,
      name: campaign.campaign_type_name,
    },
    status: {
      id: campaign.status_id,
      name: getCampaignStatus(campaign),
    },
    family: {
      id: campaign.campaign_family_id,
      name: campaign_family,
    },
    project: {
      id: campaign.project_id,
      name: campaign.display_name,
    },
    workspace: {
      id: campaign.customer_id,
      name: campaign.customer_name,
    },
    description: campaign.description,
    base_bug_internal_id: campaign.base_bug_internal_id,
  };
};
