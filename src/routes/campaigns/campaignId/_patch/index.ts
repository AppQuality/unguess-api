/** OPENAPI-CLASS: patch-campaigns */
import { getCampaign } from "@src/utils/campaigns";
import CampaignRoute from "@src/features/routes/CampaignRoute";
import * as db from "@src/features/db";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["patch-campaigns"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["patch-campaigns"]["parameters"]["path"];
  body: StoplightOperations["patch-campaigns"]["requestBody"]["content"]["application/json"];
}> {
  protected async filter() {
    if (!(await super.filter())) return false;

    if (this.isCustomerTitleEmpty() || this.isBodyEmpty()) {
      this.setError(400, {} as OpenapiError);
      return false;
    }
    return true;
  }

  private isCustomerTitleEmpty() {
    const { customer_title } = this.getBody();
    return (
      customer_title === undefined ||
      customer_title === "" ||
      customer_title.length > this.CUSTOMER_TITLE_MAX_LENGTH
    );
  }

  private isBodyEmpty() {
    return Object.keys(this.getBody()).length === 0;
  }

  protected async prepare() {
    this.setSuccess(200, await this.editCampaign());
  }

  private async editCampaign() {
    const patchRequest = this.getBody();
    // Get campaign fields and values to update
    const campaignFields = Object.keys(patchRequest);
    const campaignValues = Object.values(patchRequest);

    // Create array of fields and values to updateCampaignQueryupdate
    const updateCampaignFields = campaignFields.map(
      (field, index) => `${field} = '${db.escape(campaignValues[index])}'`
    );

    // Update campaign query
    await db.query(
      db.format(
        `
      UPDATE wp_appq_evd_campaign 
      SET ${updateCampaignFields.join(", ")} 
      WHERE id = ?`,
        [this.cp_id]
      )
    );

    // Get the updated campaign
    const campaign = await getCampaign({ campaignId: this.cp_id });

    if (!campaign) throw Error("No campaign");

    return campaign;
  }
}
