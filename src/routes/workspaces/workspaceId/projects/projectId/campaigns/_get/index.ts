/** OPENAPI-ROUTE: get-workspace-project-campaigns */
import { Context } from "openapi-backend";
import * as db from "../../../../../../../features/db";
import getProject from "../../getProject";
import getWorkspace from "../../../../getWorkspace";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;
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
    let workspace = (await getWorkspace(
      workspaceId,
      user
    )) as StoplightComponents["schemas"]["Workspace"];

    let project = (await getProject(
      projectId,
      workspaceId
    )) as StoplightComponents["schemas"]["Project"];

    // Get project campaigns
    const campaignsSql = `SELECT 
        c.id,  
        c.start_date,  
        c.end_date,
        c.close_date,
        c.title,
        c.customer_title,
        c.description,
        c.status_id,
        c.is_public,
        c.campaign_type_id,
        c.project_id,
        c.customer_id,
        ct.name AS campaign_type_name,
        ct.type AS test_type_name,
        p.display_name 
      FROM wp_appq_evd_campaign c 
      JOIN wp_appq_project p ON c.project_id = p.id 
      JOIN wp_appq_campaign_type ct ON c.campaign_type_id = ct.id 
      WHERE c.project_id = ?`;
    let campaigns = await db.query(db.format(campaignsSql, [project.id]));

    let returnCampaigns: Array<StoplightComponents["schemas"]["Campaign"]> = [];
    for (let campaign of campaigns) {
      returnCampaigns.push({
        id: campaign.id,
        start_date: new Date(campaign.start_date).toISOString(),
        end_date: new Date(campaign.end_date).toISOString(),
        close_date: new Date(campaign.close_date).toISOString(),
        title: campaign.title,
        customer_title: campaign.customer_title,
        description: campaign.description,
        status_id: campaign.status_id,
        is_public: campaign.is_public,
        campaign_type_id: campaign.campaign_type_id,
        campaign_type_name: campaign.campaign_type_name,
        project_id: campaign.project_id,
        project_name: project.name,
        test_type_name:
          campaign.test_type_name === 1 ? "Experiential" : "Functional",
      });
    }

    return returnCampaigns;
  } catch (error) {
    if ((error as OpenapiError).message == "No workspace found") {
      res.status_code = 404;
      return (error as OpenapiError).message;
    } else if (
      (error as OpenapiError).message ===
      "You have no permission to get this workspace"
    ) {
      res.status_code = 403;
      return (error as OpenapiError).message;
    } else if ((error as OpenapiError).message == "No project found") {
      res.status_code = 404;
      return (error as OpenapiError).message;
    } else {
      res.status_code = 500;
      throw error;
    }
  }
};