/** OPENAPI-ROUTE: get-workspace-campaigns */
import { Context } from "openapi-backend";
import * as db from "../../../../../features/db";

//appq_edv_campaign

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  res.status_code = 200;
  try {
    let customer_id;
    if (typeof c.request.params.wid == "string")
      customer_id = parseInt(
        c.request.params.wid
      ) as StoplightOperations["get-workspace-campaigns"]["parameters"]["path"]["wid"];

    if (!customer_id) {
      res.status_code = 400;
      return "Bad request";
    }

    const query =
      "SELECT c.*, p.display_name FROM wp_appq_evd_campaign c JOIN wp_appq_project p ON c.project_id = wp_appq_project.id WHERE c.customer_id = ?";
    let campaigns = await db.query(db.format(query, [customer_id]));
    if (!campaigns.length) return [];

    let stoplightCampaign = campaigns.map((campaign: any) => {
      return {
        id: campaign.id,
        start_date: campaign.start_date.toString(),
        end_date: campaign.end_date.toString(),
        close_date: campaign.close_date.toString(),
        title: campaign.title,
        customer_title: campaign.customer_title,
        description: campaign.description,
        status_id: campaign.status_id,
        is_public: campaign.is_public,
        campaign_type_id: campaign.campaign_type_id,
        project_id: campaign.project_id,
        customer_id: campaign.project_id,
        project_name: campaign.display_name,
      };
    });
    return stoplightCampaign as Array<
      StoplightComponents["schemas"]["Campaign"]
    >;
  } catch (e) {
    throw e;
  }
};
