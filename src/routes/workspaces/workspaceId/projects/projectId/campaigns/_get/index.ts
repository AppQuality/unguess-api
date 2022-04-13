/** OPENAPI-ROUTE: get-workspace-project-campaigns */
import { Context } from "openapi-backend";
import * as db from "../../../../../../../features/db";
import getProject from "../../getProject";
import getWorkspace from "../../../../getWorkspace";
import paginateItems, {
  formatCount,
  formatPaginationParams,
} from "@src/routes/workspaces/paginateItems";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;
  res.status_code = 200;

  try {
    let limit = c.request.query.limit || 10;
    let start = c.request.query.start || 0;

    const { formattedLimit, formattedStart } = await formatPaginationParams(
      limit,
      start
    );
    limit = formattedLimit;
    start = formattedStart;

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
        ct.type AS test_type_id,
        p.display_name 
      FROM wp_appq_evd_campaign c 
      JOIN wp_appq_project p ON c.project_id = p.id 
      JOIN wp_appq_campaign_type ct ON c.campaign_type_id = ct.id 
      WHERE c.project_id = ? LIMIT ${limit} OFFSET ${start}`;

    const countQuery = `SELECT COUNT(*)  
      FROM wp_appq_evd_campaign c 
      JOIN wp_appq_project p ON c.project_id = p.id 
      JOIN wp_appq_campaign_type ct ON c.campaign_type_id = ct.id 
      WHERE c.project_id = ?`;

    let campaigns = await db.query(db.format(campaignsSql, [project.id]));
    let total = await db.query(db.format(countQuery, [project.id]));
    total = await formatCount(total);

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
          campaign.test_type_id === 1 ? "Experiential" : "Functional",
      });
    }

    return paginateItems({ items: returnCampaigns, limit, start, total });
  } catch (error) {
    const message = (error as OpenapiError).message;
    if (message === "No workspace found") {
      res.status_code = 404;
      return message;
    } else if (message === "You have no permission to get this workspace") {
      res.status_code = 403;
      return message;
    } else if (message === "No project found") {
      res.status_code = 404;
      return message;
    } else if (message === "Bad request, pagination data is not valid") {
      res.status_code = 400;
      return message;
    } else {
      res.status_code = 500;
      throw error;
    }
  }
};
