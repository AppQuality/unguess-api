/** OPENAPI-CLASS: get-project-campaigns */
import { tryber } from "@src/features/database";
import * as db from "@src/features/db";
import ProjectRoute from "@src/features/routes/ProjectRoute";
import { getCampaignFamily, getCampaignStatus } from "@src/utils/campaigns";
import {
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
} from "@src/utils/constants";
import { formatCount } from "@src/utils/paginations";

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
    const query = tryber.tables.WpAppqEvdCampaign.do()
      .select(
        tryber.ref("id").withSchema("wp_appq_evd_campaign"),
        tryber.ref("start_date").withSchema("wp_appq_evd_campaign"),
        tryber.ref("end_date").withSchema("wp_appq_evd_campaign"),
        tryber.ref("close_date").withSchema("wp_appq_evd_campaign"),
        tryber.ref("title").withSchema("wp_appq_evd_campaign"),
        tryber.ref("customer_title").withSchema("wp_appq_evd_campaign"),
        tryber.ref("status_id").withSchema("wp_appq_evd_campaign"),
        tryber.ref("is_public").withSchema("wp_appq_evd_campaign"),
        tryber.ref("campaign_type_id").withSchema("wp_appq_evd_campaign"),
        tryber.ref("project_id").withSchema("wp_appq_evd_campaign"),
        tryber
          .ref("campaign_type")
          .withSchema("wp_appq_evd_campaign")
          .as("bug_form")
      )
      .join(
        "wp_appq_project",
        "wp_appq_project.id",
        "wp_appq_evd_campaign.project_id"
      )
      .join(
        "wp_appq_customer",
        "wp_appq_customer.id",
        "wp_appq_project.customer_id"
      )
      .select(
        tryber
          .ref("company")
          .withSchema("wp_appq_customer")
          .as("customer_name"),
        tryber.ref("id").withSchema("wp_appq_customer").as("customer_id")
      )
      .join(
        "wp_appq_campaign_type",
        "wp_appq_campaign_type.id",
        "wp_appq_evd_campaign.campaign_type_id"
      )
      .select(
        tryber
          .ref("name")
          .withSchema("wp_appq_campaign_type")
          .as("campaign_type_name"),
        tryber
          .ref("type")
          .withSchema("wp_appq_campaign_type")
          .as("campaign_family_id")
      )
      .where("wp_appq_evd_campaign.project_id", this.getProjectId());

    if (this.limit) {
      query.limit(this.limit).offset(this.start);
    }

    const campaigns = await query;

    const campaignIds = campaigns.map((c) => c.id).join(",");

    const bugCounts = await this.getBugCounts(campaignIds);
    const mediaCounts = await this.getMediaCounts(campaignIds);
    const insightsCounts = await this.getInsightsCounts(campaignIds);

    const returnCampaigns: Array<
      StoplightComponents["schemas"]["CampaignWithOutput"]
    > = [];

    for (let campaign of campaigns) {
      const outputs: ("media" | "bugs" | "insights")[] = [];
      if (bugCounts[campaign.id] && bugCounts[campaign.id] > 0)
        outputs.push("bugs");
      if (mediaCounts[campaign.id] && mediaCounts[campaign.id] > 0)
        outputs.push("media");
      if (insightsCounts[campaign.id] && insightsCounts[campaign.id] > 0)
        outputs.push("insights");
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
        workspace: {
          id: campaign.customer_id,
          name: campaign.customer_name,
        },
        family: {
          id: campaign.campaign_family_id,
          name: this.getProjectCampaignFamilyName(campaign.campaign_family_id),
        },
        outputs,
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

  private async getMediaCounts(campaignIds: any) {
    const data = await db.query(`
    SELECT campaign_id,COUNT(t.id) as total
          FROM wp_appq_campaign_task t 
          JOIN wp_appq_user_task_media m ON (m.campaign_task_id = t.id)
          WHERE t.campaign_id IN (${campaignIds}) AND m.status = 2
    GROUP BY campaign_id`);
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

  private async getInsightsCounts(campaignIds: any) {
    const data = await tryber.tables.UxCampaignData.do()
      .select("campaign_id")
      .whereIn("campaign_id", campaignIds.split(","))
      .andWhere("published", 1);

    const results: { [key: number]: number } = {};
    for (const id of campaignIds.split(",")) {
      results[id] = 0;
      const item = data.find((d) => d.campaign_id === parseInt(id));
      if (item) {
        results[id] = 1;
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
