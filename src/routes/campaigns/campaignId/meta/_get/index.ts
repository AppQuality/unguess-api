/** OPENAPI-ROUTE: get-campaigns-cid-meta */
import { Context } from "openapi-backend";
import {
  getCampaign,
  getCampaignMeta,
  getWidgetBugsByDevice,
  getWidgetBugsByUseCase,
} from "@src/utils/campaigns";
import { ERROR_MESSAGE } from "@src/utils/constants";
import { getProjectById } from "@src/utils/projects";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  const user = req.user;

  const error = {
    code: 500,
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  const cid = parseInt(c.request.params.cid as string);

  res.status_code = 200;

  try {
    if (!cid) {
      throw {
        ...error,
        code: 400,
        message: "Missing campaign id",
      };
    }

    // Check if the campaign exists
    const campaign = await getCampaign({
      campaignId: cid,
    });

    if (!campaign) {
      throw {
        ...error,
        code: 403,
        message:
          "Campaign doesn't exist or you don't have permission to view it",
      };
    }

    // Check if user has permission to access the campaign
    await getProjectById({
      projectId: campaign.project.id,
      user: user,
    });

    const meta = await getCampaignMeta(campaign);

    return {
      ...campaign,
      ...meta,
    };
  } catch (e: any) {
    res.status_code = e.code || 500;
    error.code = e.code || 500;
    error.message = e.message || ERROR_MESSAGE;

    return error;
  }
};
