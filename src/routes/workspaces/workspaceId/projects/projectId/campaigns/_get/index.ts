/** OPENAPI-ROUTE: get-workspace-project-campaigns */
import { Context } from "openapi-backend";
import * as db from "../../../../../../../features/db";
import getProject from "../../getProject";
import getWorkspace from "../../../../getWorkspace";
import {
  paginateItems,
  formatCount,
  getCampaignStatus,
} from "@src/routes/shared";
import {
  ERROR_MESSAGE,
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
} from "@src/routes/shared";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;
  let error = {
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];
  res.status_code = 200;

  let wid = parseInt(c.request.params.wid as string);
  let pid = parseInt(c.request.params.pid as string);

  let limit = c.request.query.limit
    ? parseInt(c.request.query.limit as string)
    : (LIMIT_QUERY_PARAM_DEFAULT as StoplightComponents["parameters"]["limit"]);
  let start = c.request.query.start
    ? parseInt(c.request.query.start as string)
    : (START_QUERY_PARAM_DEFAULT as StoplightComponents["parameters"]["start"]);

  try {
    await getWorkspace(wid, user);
    let projectResult = (await getProject(
      pid,
      wid
    )) as StoplightComponents["schemas"]["Project"];

    // Get project campaigns
    let campaignsSql = `SELECT 
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
        ct.type AS campaign_family_id,
        p.display_name 
      FROM wp_appq_evd_campaign c 
      JOIN wp_appq_project p ON c.project_id = p.id 
      JOIN wp_appq_campaign_type ct ON c.campaign_type_id = ct.id 
      WHERE c.project_id = ?`;

    if (limit) {
      campaignsSql += ` LIMIT ${limit} OFFSET ${start}`;
    }

    const countQuery = `SELECT COUNT(*)  
      FROM wp_appq_evd_campaign c 
      JOIN wp_appq_project p ON c.project_id = p.id 
      JOIN wp_appq_campaign_type ct ON c.campaign_type_id = ct.id 
      WHERE c.project_id = ?`;

    let campaigns = await db.query(db.format(campaignsSql, [projectResult.id]));
    let total = await db.query(db.format(countQuery, [projectResult.id]));
    total = formatCount(total);

    let returnCampaigns: Array<StoplightComponents["schemas"]["Campaign"]> = [];
    for (let campaign of campaigns) {
      // Get campaign family
      let campaign_family = "";
      switch (campaign.campaign_family_id) {
        case 0:
          campaign_family = "Experiential";
          break;
        case 1:
          campaign_family = "Functional";
          break;
      }

      returnCampaigns.push({
        id: campaign.id,
        start_date: new Date(campaign.start_date).toISOString(),
        end_date: new Date(campaign.end_date).toISOString(),
        close_date: new Date(campaign.close_date).toISOString(),
        title: campaign.title,
        customer_title: campaign.customer_title,
        status_id: campaign.status_id,
        status_name: getCampaignStatus(campaign),
        is_public: campaign.is_public,
        campaign_type_id: campaign.campaign_type_id,
        campaign_type_name: campaign.campaign_type_name,
        project_id: campaign.project_id,
        project_name: projectResult.name,
        campaign_family_id: campaign.campaign_family_id,
        campaign_family_name: campaign_family,
      });
    }

    return paginateItems({ items: returnCampaigns, limit, start, total });
  } catch (e: any) {
    if (e.code) {
      error.code = e.code;
      res.status_code = e.code;
    } else {
      error.code = 500;
      res.status_code = 500;
    }

    return error;
  }
};
