/** OPENAPI-ROUTE: get-workspace-campaigns */
import { Context } from "openapi-backend";
import * as db from "../../../../../features/db";
import getWorkspace from "@src/routes/workspaces/workspaceId/getWorkspace";

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

    await getWorkspace(customer_id);

    const query =
      "SELECT c.id, " +
      "c.start_date, " +
      "c.end_date, " +
      "c.close_date, " +
      "c.title, " +
      "c.customer_title, " +
      "c.description, " +
      "c.status_id, " +
      "c.is_public, " +
      "c.campaign_type_id, " +
      "c.project_id, " +
      "c.customer_id, " +
      "ct.name, " +
      "p.display_name FROM wp_appq_evd_campaign c " +
      "JOIN wp_appq_project p ON c.project_id = p.id " +
      "JOIN wp_appq_campaign_type ct ON c.campaign_type_id = ct.id " +
      "WHERE c.customer_id = ?";
    const campaigns = await db.query(db.format(query, [customer_id]));
    console.log(campaigns);
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
        campaign_type_name: campaign.name,
        project_id: campaign.project_id,
        customer_id: campaign.customer_id,
        project_name: campaign.display_name,
      };
    });

    return stoplightCampaign as Array<
      StoplightComponents["schemas"]["Campaign"]
    >;
  } catch (e) {
    if ((e as OpenapiError).message === "No workspace found") {
      res.status_code = 404;
      return "Workspace not found";
    }
    res.status_code = 500;
    throw e;
  }
};
