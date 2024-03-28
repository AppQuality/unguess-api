/** OPENAPI-CLASS: get-campaigns-cid-ux */
import { tryber, unguess } from "@src/features/database";
import CampaignRoute from "@src/features/routes/CampaignRoute";
import { getSignedCookie } from "@src/features/s3/cookieSign";
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

interface iFilterableFinding {
  cluster_ids: string;
  severity_id: number;
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
  private filterBy: { [key: string]: string | string[] } | undefined;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    const query = this.getQuery();
    if (this.getUser().role === "administrator" && !query.showAsCustomer) {
      this.showAsCustomer = false;
    }
    if (query.filterBy)
      this.filterBy = query.filterBy as { [key: string]: string | string[] };
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
      this.addCookieSign();
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

  private async addCookieSign() {
    const signedCookies = await getSignedCookie({
      url: `https://media*.unguess.io/CP${this.cp_id}/*`,
    });
    this.setCookie("CloudFront-Policy", signedCookies["CloudFront-Policy"], {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      domain: ".unguess.io",
    });
    this.setCookie(
      "CloudFront-Signature",
      signedCookies["CloudFront-Signature"],
      {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        domain: ".unguess.io",
      }
    );
    this.setCookie(
      "CloudFront-Key-Pair-Id",
      signedCookies["CloudFront-Key-Pair-Id"],
      {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        domain: ".unguess.io",
      }
    );
  }

  private async getFindings() {
    let findings = await tryber.tables.UxCampaignInsights.do()
      .select()
      .where({
        campaign_id: this.cp_id,
        version: this.version,
        enabled: 1,
      })
      .orderBy("order", "asc");

    const comments = await unguess.tables.UxFindingComments.do()
      .select()
      .where({
        campaign_id: this.cp_id,
      });

    let result = [];

    for (const finding of findings) {
      // Apply filterBy
      if (this.filterBy) if (!this.filterFinding(finding)) continue;

      const comment = comments.find(
        (c) => c.finding_id === finding.finding_id
      )?.comment;

      result.push({
        id: finding.finding_id,
        title: finding.title,
        description: finding.description,
        severity: {
          id: finding.severity_id,
          name: this.getSeverityName(finding.severity_id),
        },
        ...(comment && { comment }),
        cluster: await this.evaluateClusters(finding.cluster_ids),
        video: await this.getVideo(finding),
      });
    }

    //remove findings with no clusters
    result = result.filter((f) => f.cluster.length);

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

  private async getClusterIds() {
    const results = await tryber.tables.WpAppqUsecaseCluster.do()
      .where({ campaign_id: this.cp_id })
      .select("id");

    if (!results.length) return [];

    return results.map((c) => c.id);
  }

  private async getSentiment() {
    if (!this.clusters.length) return [];

    const results = await tryber.tables.UxCampaignSentiments.do()
      .select("cluster_id", "value", "comment")
      .where({
        campaign_id: this.cp_id,
        version: this.version,
      });

    if (!results.length) return [];

    return results
      .map((r) => ({
        cluster: {
          id: r.cluster_id,
          name: this.clusters.find((c) => c.id === r.cluster_id)?.name || "",
        },
        value: r.value,
        comment: r.comment,
      }))
      .filter((r) => this.clusters.map((c) => c.id).includes(r.cluster.id));
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

  private async evaluateClusters(clusterIds: string) {
    const clustersIds = await this.getClusterIds();
    if (clusterIds === "0") return "all" as const;
    return clusterIds
      .split(",")
      .map(Number)
      .map((id) => ({
        id,
        name: this.clusters.find((c) => c.id === id)?.name || "",
      }))
      .filter((c) => clustersIds.includes(c.id));
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
      const poster = r.location.replace(".mp4", ".0000000.jpg");
      const isValidPoster = await checkUrl(poster);
      video.push({
        start: r.start,
        end: r.end,
        url: this.mapToDistribution(r.location),
        description: r.description,
        streamUrl: isValidStream ? this.mapToDistribution(stream) : "",
        poster: isValidPoster ? this.mapToDistribution(poster) : undefined,
      });
    }

    return video;
  }

  private filterFinding(finding: iFilterableFinding) {
    if (!this.filterBy) return true;

    if (this.filterFindingByCluster(finding) === false) return false;
    if (this.filterFindingBySeverity(finding) === false) return false;

    return true;
  }

  private filterFindingByCluster(finding: iFilterableFinding) {
    if (!this.filterBy) return true;
    if (!this.filterBy["clusters"]) return true;
    if (typeof this.filterBy["clusters"] !== "string") return true;

    const clusterIds = finding.cluster_ids
      .split(",")
      .filter((id) => !Number.isNaN(Number(id)))
      .map((id) => Number(id));
    const clustersToFilter = this.filterBy["clusters"]
      .split(",")
      .filter((id) => !Number.isNaN(Number(id)))
      .map((id) => Number(id));
    if (!clustersToFilter.length) return true;
    return this.areElementsContained(clusterIds, clustersToFilter);
  }

  private areElementsContained(
    clusterIds: number[],
    clustersToFilter: number[]
  ) {
    return clusterIds.some((id) => clustersToFilter.includes(id));
  }

  private filterFindingBySeverity(finding: iFilterableFinding) {
    if (!this.filterBy) return true;
    if (!this.filterBy["severities"]) return true;
    if (typeof this.filterBy["severities"] !== "string") return true;

    const severitiesToFilter = this.filterBy["severities"]
      .split(",")
      .map((sevId) => (parseInt(sevId) > 0 ? parseInt(sevId) : 0))
      .filter((sevId) => sevId > 0);

    if (!severitiesToFilter.length) return true;

    return severitiesToFilter.includes(finding.severity_id);
  }

  private mapToDistribution(url: string) {
    if (url.includes("mediaconvert-encoder-staging-bucket")) {
      return url.replace(
        "https://s3-eu-west-1.amazonaws.com/mediaconvert-encoder-staging-bucket",
        "https://media-processed.dev.unguess.io"
      );
    }
    if (url.includes("mediaconvert-encoder-production-bucket")) {
      return url.replace(
        "https://s3-eu-west-1.amazonaws.com/mediaconvert-encoder-production-bucket",
        "https://media-processed.unguess.io"
      );
    }

    if (url.includes("mediaconvert-encoder-production-bucket-origin")) {
      return url.replace(
        "https://s3-eu-west-1.amazonaws.com/mediaconvert-encoder-production-bucket-origin",
        "https://media-origin.unguess.io"
      );
    }

    if (url.includes("mediaconvert-encoder-staging-bucket-origin")) {
      return url.replace(
        "https://s3-eu-west-1.amazonaws.com/mediaconvert-encoder-staging-bucket-origin",
        "https://media-origin.dev.unguess.io"
      );
    }

    return url;
  }
}
