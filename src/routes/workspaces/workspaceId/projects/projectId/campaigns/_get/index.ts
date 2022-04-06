/** OPENAPI-ROUTE: get-workspace-project-campaigns */
import { Context } from "openapi-backend";
import * as db from "../../../../../../../features/db";
import getProject from "../../getProject";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  res.status_code = 200;

  let workspaceId;
  if (typeof c.request.params.wid == "string") {
    workspaceId = parseInt(
      c.request.params.wid
    ) as StoplightOperations["get-workspace-project-campaigns"]["parameters"]["path"]["wid"];
  }

  // Check if workspaceId is valid
  if (
    typeof workspaceId == "undefined" ||
    workspaceId == null ||
    workspaceId < 0
  ) {
    res.status_code = 400;
    return "Workspace id is not valid";
  }

  let projectId;
  if (typeof c.request.params.pid == "string") {
    projectId = parseInt(
      c.request.params.pid
    ) as StoplightOperations["get-workspace-project-campaigns"]["parameters"]["path"]["pid"];
  }

  // Check if projectId is valid
  if (typeof projectId == "undefined" || projectId == null || projectId < 0) {
    res.status_code = 400;
    return "Project id is not valid";
  }

  try {
    let project: StoplightComponents["schemas"]["Project"] = await getProject(
      projectId
    );

    // Get project campaigns
    const campaignsSql =
      "SELECT id, start_date, end_date, close_date, title, customer_title, description, status_id, is_public, campaign_type_id, project_id, customer_id FROM wp_appq_evd_campaign WHERE project_id = ?";
    let campaigns = await db.query(db.format(campaignsSql, [project.id]));

    let returnCampaigns: Array<StoplightComponents["schemas"]["Campaign"]> = [];
    for (let campaign of campaigns) {
      returnCampaigns.push({
        id: campaign.id,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        close_date: campaign.close_date,
        title: campaign.title,
        customer_title: campaign.customer_title,
        description: campaign.description,
        status_id: campaign.status_id,
        is_public: campaign.is_public,
        campaign_type_id: campaign.campaign_type_id,
        project_id: campaign.project_id,
        project_name: project.name,
      });
    }

    return returnCampaigns;
  } catch (error) {
    if ((error as OpenapiError).message == "No project found") {
      res.status_code = 404;
      return (error as OpenapiError).message;
    } else {
      res.status_code = 500;
      throw error;
    }
  }
};
