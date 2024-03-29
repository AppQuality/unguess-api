/** OPENAPI-CLASS: put-campaigns-cid-findings-fid */

import { tryber, unguess } from "@src/features/database";
import CampaignRoute from "@src/features/routes/CampaignRoute";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["put-campaigns-cid-findings-fid"]["responses"]["200"];
  parameters: StoplightOperations["put-campaigns-cid-findings-fid"]["parameters"]["path"];
  body: StoplightOperations["put-campaigns-cid-findings-fid"]["requestBody"]["content"]["application/json"];
}> {
  private version: number | undefined;
  private findingId: number;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    this.findingId = Number(this.getParameters().fid);
  }

  protected async init() {
    await super.init();
    const query = tryber.tables.UxCampaignData.do()
      .select()
      .where({ campaign_id: this.cp_id })
      .andWhere({ published: 1 })
      .orderBy("version", "desc")
      .first();

    const uxData = await query;
    if (uxData) {
      this.version = uxData.version;
    }
  }

  protected async filter() {
    if (!(await super.filter())) return false;

    if (await this.noFindingData()) return false;

    return true;
  }

  private async noFindingData() {
    const finding = await tryber.tables.UxCampaignInsights.do()
      .select()
      .where({ campaign_id: this.cp_id })
      .where({ finding_id: this.findingId })
      .where({ version: this.version })
      .where({ enabled: 1 })
      .first();
    if (!this.version || !finding) {
      this.setError(404, Error("Finding not found") as OpenapiError);
      return true;
    }

    return false;
  }

  protected async prepare() {
    await this.saveComment();
    this.setSuccess(200, {});
  }

  private async saveComment() {
    try {
      const comment = await unguess.tables.UxFindingComments.do()
        .select()
        .where({ campaign_id: this.cp_id })
        .where({ finding_id: this.findingId });

      if (comment.length) {
        await this.updateComment();
      } else {
        await this.createComment();
      }
    } catch (e) {
      throw Error("Error on fetching comment");
    }
  }

  private async updateComment() {
    try {
      await unguess.tables.UxFindingComments.do()
        .update({
          comment: this.getBody().comment,
          profile_id: this.getProfileId(),
        })
        .where({ campaign_id: this.cp_id })
        .where({ finding_id: this.findingId });
    } catch (e) {
      throw Error("Error updating comment");
    }
  }

  private async createComment() {
    try {
      await unguess.tables.UxFindingComments.do().insert({
        campaign_id: this.cp_id,
        finding_id: this.findingId,
        comment: this.getBody().comment,
        profile_id: this.getProfileId(),
      });
    } catch (e) {
      throw Error("Error saving comment");
    }
  }
}
