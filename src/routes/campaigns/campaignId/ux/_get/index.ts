/** OPENAPI-CLASS: get-campaigns-cid-ux */
import { tryber } from "@src/features/database";
import CampaignRoute from "@src/features/routes/CampaignRoute";
import { checkUrl } from "@src/utils/checkUrl";

interface iUxCampaignData {
  id: number;
  campaign_id: number;
  version: number;
  published: number;
  methodology_description: string;
  methodology_type: string;
  goal: string;
  users: number;
  modification_time: string;
  created_time: string;
}

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-ux"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-ux"]["parameters"]["path"];
  query: StoplightOperations["get-campaigns-cid-ux"]["parameters"]["query"];
}> {
  private showAsCustomer: boolean = true;
  private version: number | undefined;
  private uxData: iUxCampaignData | undefined;
  private _clusters: { id: number; name: string }[] | undefined;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    const query = this.getQuery();
    if (this.getUser().role === "administrator" && !query.showAsCustomer) {
      this.showAsCustomer = false;
    }
  }

  get clusters() {
    if (!this._clusters) throw new Error("Clusters not initialized");
    return this._clusters;
  }

  protected async init() {
    await super.init();
    const query = tryber.tables.UxCampaignData.do()
      .select()
      .where({ campaign_id: this.cp_id })
      .orderBy("version", "desc")
      .first();

    if (this.showAsCustomer) {
      query.where("published", 1);
    }

    const uxData = await query;

    if (uxData) {
      this.version = uxData.version;
      this.uxData = uxData;
    }

    this._clusters = await tryber.tables.WpAppqUsecaseCluster.do()
      .select("id", tryber.ref("title").as("name"))
      .where({ campaign_id: this.cp_id });
  }

  protected async filter() {
    if (!(await super.filter())) return false;

    if (await this.noUxData()) return false;
    return true;
  }

  private async noUxData() {
    if (!this.version || !this.uxData) {
      this.setError(404, Error("UX data not found") as OpenapiError);
      return true;
    }

    return false;
  }

  protected async prepare() {
    if (this.version && this.uxData) {
      const sentiment = await this.getSentiment();

      this.setSuccess(200, {
        version: this.version,
        goal: this.uxData.goal ?? "",
        users: this.uxData.users ?? 0,
        methodology: {
          type: this.uxData.methodology_type ?? "",
          description: this.uxData.methodology_description ?? "",
        },
        findings: await this.getFindings(),
        questions: await this.getQuestions(),
        ...(sentiment.length && { sentiment: sentiment }),
      });
    }
  }

  private async getFindings() {
    const findings = await tryber.tables.UxCampaignInsights.do()
      .select()
      .where({
        campaign_id: this.cp_id,
        version: this.version,
      })
      .orderBy("order", "asc");

    const result = [];

    for (const finding of findings) {
      result.push({
        id: finding.id,
        title: finding.title,
        description: finding.description,
        severity: {
          id: finding.severity_id,
          name: this.getSeverityName(finding.severity_id),
        },
        cluster: this.getClusters(finding.cluster_ids),
        video: await this.getVideo(finding),
      });
    }
    return result;
  }

  private async getQuestions() {
    const results = await tryber.tables.UxCampaignQuestions.do()
      .select("question")
      .where({
        campaign_id: this.cp_id,
        version: this.version,
      });

    if (!results.length) return [];

    return results.map((r) => ({
      text: r.question,
    }));
  }

  private async getSentiment() {
    if (!this.clusters.length) return [];

    const results = await tryber.tables.UxCampaignSentiments.do()
      .select("cluster_id", "value")
      .where({
        campaign_id: this.cp_id,
        version: this.version,
      });

    if (!results.length) return [];

    return results.map((r) => ({
      cluster: {
        id: r.cluster_id,
        name: this.clusters.find((c) => c.id === r.cluster_id)?.name || "",
      },
      value: r.value,
    }));
  }

  private getSeverityName(severityId: number) {
    switch (severityId) {
      case 1:
        return "Minor";
      case 2:
        return "Major";
      case 3:
        return "Positive";
      case 4:
        return "Observation";
      default:
        throw new Error("Invalid severity id");
    }
  }

  private getClusters(clusterIds: string) {
    if (clusterIds === "0") return "all" as const;
    return clusterIds
      .split(",")
      .map(Number)
      .map((id) => ({
        id,
        name: this.clusters.find((c) => c.id === id)?.name || "",
      }));
  }

  private async getVideo(finding: { id: number }) {
    const results = await tryber.tables.UxCampaignVideoParts.do()
      .select()
      .where({
        insight_id: finding.id,
      })
      .join(
        "wp_appq_user_task_media",
        "wp_appq_user_task_media.id",
        "ux_campaign_video_parts.media_id"
      )
      .where("location", "like", "%.mp4")
      .orderBy("order", "asc");

    const video = [];
    for (const r of results) {
      const stream = r.location.replace(".mp4", "-stream.m3u8");
      const isValidStream = await checkUrl(stream);
      video.push({
        start: r.start,
        end: r.end,
        url: r.location,
        description: r.description,
        streamUrl: isValidStream ? stream : "",
      });
    }

    return video;
  }
}
