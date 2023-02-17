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

    if (this.bodyIsEmpty()) return this.setError(400, {} as OpenapiError);

    this.setSuccess(200, await this.editCampaign(this.cp_id, this.getBody()));
  }

  protected async editCampaign(
    campaignId: number,
    patchRequest: StoplightOperations["patch-campaigns"]["requestBody"]["content"]["application/json"]
  ): Promise<StoplightComponents["schemas"]["Campaign"]> {
    if (
      !patchRequest.customer_title ||
      patchRequest.customer_title.length > 256
    ) {
      this.setError(400, {} as OpenapiError);
    }

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

/* export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;
  let error = {
    code: 500,
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];
  let request_body: StoplightComponents["requestBodies"]["Campaign"]["content"]["application/json"] =
    req.body;

  let cid = parseInt(c.request.params.cid as string);

  res.status_code = 200;

  try {
    // Check if cp exists
    const campaign = await getCampaign({ campaignId: cid });

    if (!campaign) {
      throw { ...error, code: 400 };
    }

    // Check if user has permission to edit the campaign
    await getProjectById({
      projectId: campaign.project.id,
      user: user,
    });

    const campaignPatched = await editCampaign(cid, request_body);

    return campaignPatched as StoplightComponents["schemas"]["Campaign"];
  } catch (e: any) {
    if (e.code) {
      error.code = e.code;
      res.status_code = e.code;
    } else {
      error.code = 500;
      res.status_code = 500;
    }

    return error;
  }
}; */
