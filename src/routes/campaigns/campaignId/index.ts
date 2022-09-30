/** OPENAPI-ROUTE: get-campaign */
import { Context } from "openapi-backend";
import { ERROR_MESSAGE } from "@src/utils/constants";
import { getCampaign, getCampaignOutputs } from "@src/utils/campaigns";
import { getProjectById } from "@src/utils/projects";

export default async (
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

  let cid = parseInt(c.request.params.cid as string);

  res.status_code = 200;

  try {
    // Check if the campaign exists
    let campaign = await getCampaign(cid);

    if (!campaign) {
      error.code = 400;
      throw error;
    }

    // Check if user has permission to edit the campaign
    await getProjectById({
      projectId: campaign.project.id,
      user: user,
    });

    // Get the campaign
    const outputs = await getCampaignOutputs({
      campaignId: campaign.id,
    });
    return {
      ...campaign,
      outputs,
    } as StoplightComponents["schemas"]["CampaignWithOutput"];
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
};
