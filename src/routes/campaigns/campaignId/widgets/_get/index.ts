/** OPENAPI-ROUTE: get-campaigns-cid-widgets-wslug */
import { Context } from "openapi-backend";
import {
  getCampaign,
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
  const widget = c.request.query.s as string;

  res.status_code = 200;

  try {
    if (!cid || !widget) {
      throw {
        ...error,
        code: 400,
        message: "Missing campaign id or widget slug",
      };
    }

    // Check if the campaign exists
    const campaign = await getCampaign({
      campaignId: cid,
      withOutputs: true,
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

    // Return requested widget
    switch (widget) {
      case "bugs-by-usecase":
        return await getWidgetBugsByUseCase(campaign);
      case "bugs-by-device":
        return await getWidgetBugsByDevice(campaign);
    }

    throw {
      ...error,
      code: 401,
      message: "The requested widget is not available or you don't have access",
    };
  } catch (e: any) {
    res.status_code = e.code || 500;
    error.code = e.code || 500;
    error.message = e.message || ERROR_MESSAGE;

    return error;
  }
};
