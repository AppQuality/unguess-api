/** OPENAPI-CLASS: get-workspace-campaigns */
import * as db from "@src/features/db";
import { getWorkspace } from "@src/utils/workspaces";
import { getUserProjects } from "@src/utils/projects";
import {
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
} from "@src/utils/constants";
import { getCampaignFamily, getCampaignStatus } from "@src/utils/campaigns";

import UserRoute from "@src/features/routes/UserRoute";

export default class Route extends UserRoute<{
  response: StoplightOperations["get-workspace-campaigns"]["responses"]["200"]["content"]["application/json"];
  query: StoplightOperations["get-workspace-campaigns"]["parameters"]["query"];
  parameters: StoplightOperations["get-workspace-campaigns"]["parameters"]["path"];
}> {
  private workspaceId: number;
  private limit: number = LIMIT_QUERY_PARAM_DEFAULT;
  private start: number = START_QUERY_PARAM_DEFAULT;
  private order: "ASC" | "DESC" | undefined;
  private orderBy:
    | "start_date"
    | "end_date"
    | "close_date"
    | "title"
    | undefined;

  private VALID_FILTER_BY_FIELDS: { [key: string]: string } = {
    customer_title: "c.customer_title",
    title: "c.title",
    campaign_type_name: "ct.name",
    test_type_name: "ct.type",
    project_name: "p.display_name",
  };

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    const query = this.getQuery();
    if (query.limit)
      this.limit = Number.parseInt(query.limit as unknown as string);
    if (query.start)
      this.start = Number.parseInt(query.start as unknown as string);

    this.order = this.getOrder();
    this.orderBy = this.getOrderBy();

    const parameters = this.getParameters();
    this.workspaceId = Number.parseInt(parameters.wid);
  }

  private getOrder() {
    const query = this.getQuery();
    if (query.order) {
      if (["ASC", "DESC"].includes(query.order)) {
        return query.order as "ASC" | "DESC";
      } else {
        throw { code: 400, message: "Something went wrong" };
      }
    }
    return undefined;
  }

  private getOrderBy() {
    const query = this.getQuery();
    if (query.orderBy) {
      if (
        ["start_date", "end_date", "close_date", "title"].includes(
          query.orderBy
        )
      ) {
        return query.orderBy as
          | "start_date"
          | "end_date"
          | "close_date"
          | "title";
      } else {
        throw { code: 400, message: "Something went wrong" };
      }
    }
    return undefined;
  }

  protected async init(): Promise<void> {
    await super.init();

    if (isNaN(this.workspaceId)) {
      this.setError(400, {
        code: 400,
        message: "Invalid workspace",
      } as OpenapiError);

      throw new Error("Invalid workspace");
    }
  }

  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) return false;

    try {
      await getWorkspace({
        workspaceId: this.workspaceId,
        user: this.getUser(),
      });
      return true;
    } catch (err) {
      throw { code: 403, message: "Something went wrong" };
    }
  }

  protected async prepare(): Promise<void> {
    const userProjects = await getUserProjects({
      workspaceId: this.workspaceId,
      user: this.getUser(),
    });

    if (!userProjects.length) return this.returnEmptyList();

    let campaigns;
    try {
      campaigns = await this.getCampaigns(userProjects);
    } catch (err) {
      throw { code: 400, message: "Something went wrong" };
    }

    if (!campaigns.length) return this.returnEmptyList();

    const preparedCampaignResponse = await this.enhanceCampaigns(campaigns);
    return this.setSuccess(200, {
      items: preparedCampaignResponse,
      start: this.start,
      limit: this.limit,
      size: preparedCampaignResponse.length,
      total: await this.getTotal(userProjects),
    });
  }

  private async enhanceCampaigns(campaigns: any) {
    const campaignIds = campaigns
      .map((c: { id: number }) => db.format("?", [c.id]))
      .join(",");
    const bugCounts = await this.getBugCounts(campaignIds);
    const mediaCounts = await this.getMediaCounts(campaignIds);
    return campaigns.map((campaign: any) => {
      const campaign_family = getCampaignFamily({
        familyId: campaign.campaign_family_id,
      });

      let outputs: ("media" | "bugs")[] = [];
      if (bugCounts[campaign.id] && bugCounts[campaign.id] > 0)
        outputs.push("bugs");
      if (mediaCounts[campaign.id] && mediaCounts[campaign.id] > 0)
        outputs.push("media");

      return {
        id: campaign.id,
        start_date: campaign.start_date.toString(),
        end_date: campaign.end_date.toString(),
        close_date: campaign.close_date.toString(),
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
        family: {
          id: campaign.campaign_family_id,
          name: campaign_family,
        },
        project: {
          id: campaign.project_id,
          name: campaign.display_name,
        },
        outputs,
      };
    });
  }

  private async getCampaigns(userProjects: Project[]) {
    let userProjectsID = userProjects.map((p) => p.id).join(",");
    //TODO: check why the cp type is in a LEFT JOIN relation
    const query = `SELECT 
        c.id,  
        c.start_date,  
        c.end_date,
        c.close_date,
        c.title,
        c.customer_title,
        c.status_id,
        c.is_public,
        c.campaign_type_id,
        c.campaign_type AS bug_form,
        c.project_id,
        c.customer_id,
        ct.name AS campaign_type_name,
        ct.type AS campaign_family_id,
        p.display_name
      FROM wp_appq_evd_campaign c 
      JOIN wp_appq_project p ON c.project_id = p.id 
      LEFT JOIN wp_appq_campaign_type ct ON c.campaign_type_id = ct.id 
      WHERE p.id IN (${userProjectsID})
      ${this.getAndFromFilterBy()}
      GROUP BY c.id
      ${
        this.order && this.orderBy
          ? ` ORDER BY ${this.orderBy} ${this.order}`
          : ``
      }
      ${this.limit ? ` LIMIT ${this.limit} OFFSET ${this.start}` : ``}
    `;

    return await db.query(query);
  }

  private getAndFromFilterBy() {
    const query = this.getQuery();
    const filterBy = query.filterBy as { [key: string]: string | string[] };
    if (!filterBy) return "";

    let AND = ``;
    let filterByQuery: string[] = [];
    let acceptedFilters = Object.keys(this.VALID_FILTER_BY_FIELDS).filter((f) =>
      Object.keys(filterBy).includes(f)
    );

    if (!acceptedFilters.length) {
      throw { code: 400, message: "Something went wrong" };
    } else {
      acceptedFilters = acceptedFilters.map((k) => {
        const v = filterBy[k];
        if (typeof v === "string") {
          filterByQuery.push(`%${v}%`);
          return `${this.VALID_FILTER_BY_FIELDS[k]} LIKE ?`;
        }
        const orQuery = v
          .map((el: string) => {
            filterByQuery.push(`%${el}%`);
            return `${this.VALID_FILTER_BY_FIELDS[k]} LIKE ?`;
          })
          .join(" OR ");
        return ` ( ${orQuery} ) `;
      });
      AND = `AND ${Object.values(acceptedFilters).join(` AND `)}`;
      AND = db.format(AND, filterByQuery);
    }
    return AND;
  }

  private async getTotal(userProjects: Project[]) {
    const userProjectsIDs = userProjects.map((p) => p.id).join(",");
    const countQuery = `SELECT COUNT(*) as count 
    FROM wp_appq_evd_campaign c 
    JOIN wp_appq_project p ON c.project_id = p.id 
    WHERE p.id IN (${userProjectsIDs})`;
    const total = await db.query(countQuery);
    if (!total.length) return 0;
    return total[0].count;
  }

  private returnEmptyList() {
    return this.setSuccess(200, {
      items: [],
      start: 0,
      limit: 0,
      size: 0,
      total: 0,
    });
  }

  private async getMediaCounts(campaignIds: any) {
    const data = await db.query(`
    SELECT campaign_id,COUNT(t.id) as total
          FROM wp_appq_campaign_task t 
          JOIN wp_appq_user_task_media m ON (m.campaign_task_id = t.id)
          WHERE t.campaign_id IN (${campaignIds}) AND m.status = 2`);
    const results: { [key: number]: number } = {};
    for (const id of campaignIds.split(",")) {
      results[id] = 0;
      const item = data.find(
        (d: { campaign_id: number }) => d.campaign_id === parseInt(id)
      );
      if (item) {
        results[id] = item.total;
      }
    }
    return results;
  }

  private async getBugCounts(campaignIds: any) {
    const data = await db.query(`SELECT campaign_id,
    SUM(CASE WHEN b.status_id = 2 THEN 1 ELSE 0 END) as approvedBugs,
    SUM(CASE WHEN b.status_id = 4 THEN 1 ELSE 0 END) as reviewBugs,
    c.cust_bug_vis                                   as showNeedReview
FROM wp_appq_evd_bug b
      JOIN wp_appq_evd_campaign c ON (c.id = b.campaign_id)
WHERE campaign_id IN (${campaignIds}) AND b.publish = 1
GROUP BY campaign_id;
    `);
    const results: { [key: number]: number } = {};
    for (const id of campaignIds.split(",")) {
      results[id] = 0;
      const item = data.find(
        (d: { campaign_id: number }) => d.campaign_id === parseInt(id)
      );
      if (item) {
        results[id] = item.approvedBugs;
        if (item.showNeedReview === 1) {
          results[id] += item.reviewBugs;
        }
      }
    }
    return results;
  }
}
