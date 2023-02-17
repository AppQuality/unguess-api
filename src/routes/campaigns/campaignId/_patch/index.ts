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

    const { customer_title } = this.getBody();

    if (
      customer_title === undefined ||
      customer_title === "" ||
      customer_title.length > this.CUSTOMER_TITLE_MAX_LENGTH ||
      this.bodyIsEmpty()
    ) {
      return this.setError(400, {} as OpenapiError);
    }

    const projectId = this.getProjectId();
    if (!projectId) return this.setError(401, {} as OpenapiError);

    if (!campaign) return this.setError(404, {} as OpenapiError);

    this.setSuccess(200, await this.editCampaign(this.cp_id, this.getBody()));
  }

  private bodyIsEmpty() {
    return Object.keys(this.getBody()).length === 0;
  }

  private async editCampaign(
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

    await db.query(db.format(updateCampaignQuery, [campaignId]));

    // Get the updated campaign
    const campaign = await getCampaign({ campaignId });

    return campaign as StoplightComponents["schemas"]["Campaign"];
  }
}
