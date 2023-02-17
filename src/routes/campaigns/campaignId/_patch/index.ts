/** OPENAPI-CLASS: patch-campaigns */
import { getCampaign } from "@src/utils/campaigns";
import CampaignRoute from "@src/features/routes/CampaignRoute";
import * as db from "@src/features/db";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["patch-campaigns"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["patch-campaigns"]["parameters"]["path"];
  body: StoplightComponents["requestBodies"]["Campaign"]["content"]["application/json"];
}> {
  protected async prepare() {
    const campaign = await getCampaign({
      campaignId: this.cp_id,
      withOutputs: true,
    });

    if (!campaign) return this.setError(404, {} as OpenapiError);

    const projectId = this.getProjectId();
    if (!projectId) return this.setError(401, {} as OpenapiError);

    const rBody = this.getBody();
    const { customer_title } = rBody;

    if (
      customer_title === undefined ||
      customer_title === "" ||
      customer_title.length > 256
    ) {
      return this.setError(400, {} as OpenapiError);
    }

    if (this.bodyIsEmpty()) return this.setError(400, {} as OpenapiError);

    this.setSuccess(200, await this.editCampaign(this.cp_id, this.getBody()));
  }

  protected async editCampaign(
    campaignId: number,
    patchRequest: StoplightOperations["patch-campaigns"]["requestBody"]["content"]["application/json"]
  ): Promise<StoplightComponents["schemas"]["Campaign"]> {
    // Get campaign fields and values to update
    const campaignFields = Object.keys(patchRequest);
    const campaignValues = Object.values(patchRequest);

    // Create array of fields and values to update
    const updateCampaignFields = campaignFields.map((field, index) => {
      return `${field} = '${db.escape(campaignValues[index])}'`;
    });

    // Update campaign query
    const updateCampaignQuery = `UPDATE wp_appq_evd_campaign SET ${updateCampaignFields.join(
      ", "
    )} WHERE id = ?`;

    const updateCampaignSql = db.format(updateCampaignQuery, [campaignId]);

    await db.query(updateCampaignSql);

    // Get the updated campaign
    const campaign = await getCampaign({ campaignId });

    return campaign as StoplightComponents["schemas"]["Campaign"];
  }
}
