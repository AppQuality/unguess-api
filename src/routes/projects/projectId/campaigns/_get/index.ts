/** OPENAPI-CLASS: get-project-campaigns */
import { Context } from "openapi-backend";
import * as db from "@src/features/db";
import { getProjectById } from "@src/utils/projects";
import { paginateItems, formatCount } from "@src/utils/paginations";
import {
  getCampaignFamily,
  getCampaignOutputs,
  getCampaignStatus,
} from "@src/utils/campaigns";
import {
  ERROR_MESSAGE,
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
} from "@src/utils/constants";
import ProjectRoute from "@src/features/routes/ProjectRoute";

export default class Route extends ProjectRoute<{
  response: StoplightOperations["get-project-campaigns"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-project-campaigns"]["parameters"]["path"];
  query: StoplightOperations["get-project-campaigns"]["parameters"]["query"];
}> {
  private limit: number = LIMIT_QUERY_PARAM_DEFAULT;
  private start: number = START_QUERY_PARAM_DEFAULT;
  private total: number = 0;
  private campaigns: StoplightComponents["schemas"]["CampaignWithOutput"][] =
    [];

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);

    const query = this.getQuery();
    if (query.limit) this.limit = parseInt(query.limit as unknown as string);
    if (query.start) this.start = parseInt(query.start as unknown as string);
  }

  protected async prepare(): Promise<void> {
    await this.getProjectCampaigns();
    await this.getProjectCampaignsCount();
    return this.setSuccess(200, {
      items: this.campaigns,
      total: this.total,
      start: this.start,
      limit: this.limit,
      size: this.campaigns.length,
    });
  }

  private async getProjectCampaigns(): Promise<void> {
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
        c.campaign_type AS bug_form,
        ct.name AS campaign_type_name,
        ct.type AS campaign_family_id,
        o.bugs, 
        o.media
      FROM wp_appq_evd_campaign c 
      JOIN wp_appq_project p ON c.project_id = p.id 
      JOIN wp_appq_campaign_type ct ON c.campaign_type_id = ct.id
      LEFT JOIN campaigns_outputs o ON (o.campaign_id = c.id)
      WHERE c.project_id = ? group by c.id`;

    if (this.limit) {
      campaignsSql += ` LIMIT ${this.limit} OFFSET ${this.start}`;
    }

    let campaigns = await db.query(
      db.format(campaignsSql, [this.getProjectId()])
    );

    const returnCampaigns: Array<
      StoplightComponents["schemas"]["CampaignWithOutput"]
    > = [];

    for (let campaign of campaigns) {
      returnCampaigns.push({
        id: campaign.id,
        start_date: new Date(campaign.start_date).toISOString(),
        end_date: new Date(campaign.end_date).toISOString(),
        close_date: new Date(campaign.close_date).toISOString(),
        title: campaign.title,
        customer_title: campaign.customer_title,
        is_public: campaign.is_public,
        bug_form: campaign.bug_form,
        status: {
          id: campaign.status_id,
          name: getCampaignStatus({
            status_id: campaign.status_id,
            start_date: campaign.start_date,
          }),
        },
        type: {
          id: campaign.campaign_type_id,
          name: campaign.campaign_type_name,
        },
        project: {
          id: this.getProjectId(),
          name: this.getProject().name,
        },
        family: {
          id: campaign.campaign_family_id,
          name: this.getProjectCampaignFamilyName(campaign.campaign_family_id),
        },
        outputs: this.getProjectCampaignOutputs(campaign),
      });
    }

    this.campaigns = returnCampaigns;
  }

  private async getProjectCampaignsCount(): Promise<void> {
    const countQuery = `SELECT COUNT(*) as count
      FROM wp_appq_evd_campaign c 
      JOIN wp_appq_project p ON c.project_id = p.id 
      JOIN wp_appq_campaign_type ct ON c.campaign_type_id = ct.id 
      WHERE c.project_id = ?`;

    let total = await db.query(db.format(countQuery, [this.getProjectId()]));
    this.total = formatCount(total) as number;
  }

  private getProjectCampaignFamilyName(familyId: number): string {
    return getCampaignFamily({
      familyId,
    });
  }

  private getProjectCampaignOutputs(
    campaign: StoplightComponents["schemas"]["Campaign"] & {
      media: number;
    } & {
      bugs: number;
    }
  ): StoplightComponents["schemas"]["Output"][] {
    return getCampaignOutputs(campaign);
  }
}

// export default async (
//   c: Context,
//   req: OpenapiRequest,
//   res: OpenapiResponse
// ) => {
//   let user = req.user;
//   let error = {
//     message: ERROR_MESSAGE,
//     error: true,
//   } as StoplightComponents["schemas"]["Error"];
//   res.status_code = 200;

//   let pid = parseInt(c.request.params.pid as string);

//   let limit = c.request.query.limit
//     ? parseInt(c.request.query.limit as string)
//     : (LIMIT_QUERY_PARAM_DEFAULT as StoplightComponents["parameters"]["limit"]);
//   let start = c.request.query.start
//     ? parseInt(c.request.query.start as string)
//     : (START_QUERY_PARAM_DEFAULT as StoplightComponents["parameters"]["start"]);

//   try {
//     let prj = (await getProjectById({
//       projectId: pid,
//       user: user,
//     })) as StoplightComponents["schemas"]["Project"];

//     // Get project campaigns
//     let campaignsSql = `SELECT
//         c.id,
//         c.start_date,
//         c.end_date,
//         c.close_date,
//         c.title,
//         c.customer_title,
//         c.status_id,
//         c.is_public,
//         c.campaign_type_id,
//         c.project_id,
//         c.customer_id,
//         c.campaign_type AS bug_form,
//         ct.name AS campaign_type_name,
//         ct.type AS campaign_family_id,
//         o.bugs,
//         o.media
//       FROM wp_appq_evd_campaign c
//       JOIN wp_appq_project p ON c.project_id = p.id
//       JOIN wp_appq_campaign_type ct ON c.campaign_type_id = ct.id
//       LEFT JOIN campaigns_outputs o ON (o.campaign_id = c.id)
//       WHERE c.project_id = ? group by c.id`;

//     if (limit) {
//       campaignsSql += ` LIMIT ${limit} OFFSET ${start}`;
//     }

//     const countQuery = `SELECT COUNT(*) as count
//       FROM wp_appq_evd_campaign c
//       JOIN wp_appq_project p ON c.project_id = p.id
//       JOIN wp_appq_campaign_type ct ON c.campaign_type_id = ct.id
//       WHERE c.project_id = ?`;

//     let campaigns = await db.query(db.format(campaignsSql, [prj.id]));

//     let total = await db.query(db.format(countQuery, [prj.id]));
//     total = formatCount(total);

//     let returnCampaigns: Array<
//       StoplightComponents["schemas"]["CampaignWithOutput"]
//     > = [];
//     for (let campaign of campaigns) {
//       // Get campaign family
//       const campaign_family = getCampaignFamily({
//         familyId: campaign.campaign_family_id,
//       });

//       const outputs = getCampaignOutputs(campaign);

//       returnCampaigns.push({
//         id: campaign.id,
//         start_date: new Date(campaign.start_date).toISOString(),
//         end_date: new Date(campaign.end_date).toISOString(),
//         close_date: new Date(campaign.close_date).toISOString(),
//         title: campaign.title,
//         customer_title: campaign.customer_title,
//         is_public: campaign.is_public,
//         bug_form: campaign.bug_form,
//         status: {
//           id: campaign.status_id,
//           name: getCampaignStatus({
//             status_id: campaign.status_id,
//             start_date: campaign.start_date,
//           }),
//         },
//         type: {
//           id: campaign.campaign_type_id,
//           name: campaign.campaign_type_name,
//         },
//         project: {
//           id: campaign.project_id,
//           name: prj.name,
//         },
//         family: {
//           id: campaign.campaign_family_id,
//           name: campaign_family,
//         },
//         outputs,
//       });
//     }

//     return paginateItems({ items: returnCampaigns, limit, start, total });
//   } catch (e: any) {
//     if (e.code) {
//       error.code = e.code;
//       res.status_code = e.code;
//     } else {
//       error.code = 500;
//       res.status_code = 500;
//     }

//     return error;
//   }
// };
