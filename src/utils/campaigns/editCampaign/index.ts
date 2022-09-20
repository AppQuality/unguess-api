import * as db from "@src/features/db";
import { ERROR_MESSAGE } from "@src/utils/constants";
import { getCampaign } from "../getCampaign";

export const editCampaign = async (
  campaignId: number,
  patchRequest: StoplightOperations["patch-campaigns"]["requestBody"]["content"]["application/json"]
): Promise<StoplightComponents["schemas"]["Campaign"]> => {
  let error = {
    code: 400,
    message: ERROR_MESSAGE + " with campaign edit",
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  // Check if mandatory fields are present
  if (!patchRequest.customer_title) {
    throw error;
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

  // Update campaign
  try {
    const updateCampaignSql = db.format(updateCampaignQuery, [campaignId]);

    await db.query(updateCampaignSql);

    // Get the updated campaign
    const campaign = await getCampaign(campaignId);

    return campaign as StoplightComponents["schemas"]["Campaign"];
  } catch (e: any) {
    throw { ...error, code: 500 };
  }
};
