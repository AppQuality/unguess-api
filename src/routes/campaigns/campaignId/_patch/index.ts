/** OPENAPI-CLASS: patch-campaigns */
import { getCampaign } from "@src/utils/campaigns";
import CampaignRoute from "@src/features/routes/CampaignRoute";
import * as db from "@src/features/db";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["patch-campaigns"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["patch-campaigns"]["parameters"]["path"];
  body: StoplightComponents["requestBodies"]["Campaign"]["content"]["application/json"];
}> {
  protected async filter() {
    if (!(await super.filter())) return false;
    const { customer_title } = this.getBody();

    if (
      customer_title === undefined ||
      customer_title === "" ||
      customer_title.length > this.CUSTOMER_TITLE_MAX_LENGTH ||
      this.bodyIsEmpty()
    ) {
      this.setError(400, {} as OpenapiError);
      return false;
    }
    return true;
  }

  protected async prepare() {
    this.setSuccess(200, await this.editCampaign());
  }

  private bodyIsEmpty() {
    return Object.keys(this.getBody()).length === 0;
  }

  private async editCampaign(): Promise<
    StoplightComponents["schemas"]["Campaign"]
  > {
    const patchRequest =
      this.getBody() as StoplightOperations["patch-campaigns"]["requestBody"]["content"]["application/json"];
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

    await db.query(db.format(updateCampaignQuery, [this.cp_id]));

    // Get the updated campaign
    const campaign = await getCampaign({ campaignId: this.cp_id });

    return campaign as StoplightComponents["schemas"]["Campaign"];
  }
}
