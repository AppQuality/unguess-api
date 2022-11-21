/** OPENAPI-ROUTE: get-campaigns-cid-widgets-wslug */
import { Context } from "openapi-backend";
import {
  getCampaign,
  getWidgetBugsByDevice,
  getWidgetBugsByUseCase,
  getWidgetCampaignProgress,
} from "@src/utils/campaigns";
import { ERROR_MESSAGE } from "@src/utils/constants";
import { getProjectById } from "@src/utils/projects";
import getCampaignBugsTrend from "./uniqueBugsWidget/getCampaignBugsTrend";
import updateTrend from "./uniqueBugsWidget/updateTrend";
import getCampaignBugSituation from "./uniqueBugsWidget/getCampaignBugSituation";

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
  const widget = c.request.query
    .s as StoplightComponents["parameters"]["wslug"];
  const shouldUpdateTrend = c.request.query.hasOwnProperty("updateTrend");

  if (widget !== "unique-bugs" && shouldUpdateTrend) {
    res.status_code = 422;
    throw {
      message: "Invalid query parameter",
      code: 422,
    };
  }
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
      case "cp-progress":
        return await getWidgetCampaignProgress(campaign);
      case "unique-bugs":
        const { unique, total } = await getCampaignBugSituation(campaign);

        const trend = await getCampaignBugsTrend({
          campaignId: campaign.id,
          userId: user.id,
          unique,
        });
        if (shouldUpdateTrend) {
          await updateTrend({
            campaignId: campaign.id,
            userId: user.id,
            unique,
          });
        }
        return {
          data: { unique, total, trend },
          kind: "campaignUniqueBugs",
        };
    }

    throw {
      ...error,
      code: 401,
      message: "The requested widget is not available or you don't have access",
    };
  } catch (e: any) {
    res.status_code = e.code || 500;
    error.code = typeof e.code === "number" ? e.code : 500;
    error.message = e.message || ERROR_MESSAGE;

    throw error;
  }
};
