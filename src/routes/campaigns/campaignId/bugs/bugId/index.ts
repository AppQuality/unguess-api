/** OPENAPI-ROUTE: get-campaigns-single-bug */
import { Context } from "openapi-backend";
import { ERROR_MESSAGE } from "@src/utils/constants";
import { getCampaign } from "@src/utils/campaigns";
import { getProjectById } from "@src/utils/projects";
import { getBugById } from "@src/utils/bugs";
import {
  getTitleRule,
  getFormattedContext,
} from "@src/utils/campaigns/getTitleRule";

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
  const campaign_id = parseInt(c.request.params.cid as string);
  const bug_id = parseInt(c.request.params.bid as string);

  res.status_code = 200;

  try {
    if (!campaign_id || !bug_id) {
      error.code = 400;
      throw error;
    }

    // Check if the campaign exists
    const campaign = await getCampaign({
      campaignId: campaign_id,
      withOutputs: false,
    });

    if (!campaign) {
      error.code = 400;
      throw error;
    }

    // Check if user has permission to edit the campaign
    await getProjectById({
      projectId: campaign.project.id,
      user: user,
    });

    const bug = await getBugById(bug_id);
    const titleRuleIsActive = await getTitleRule(campaign_id);

    const formattedContext = getFormattedContext(bug.title);
    return {
      ...bug,
      contextless_title: titleRuleIsActive
        ? formattedContext?.contextless_title
        : undefined,
      context: titleRuleIsActive ? formattedContext?.context : undefined,
    } as StoplightOperations["get-campaigns-single-bug"]["responses"]["200"]["content"]["application/json"];
  } catch (e: any) {
    if (e.code) {
      error.code = e.code;
      res.status_code = e.code;
    } else {
      error.code = 500;
      res.status_code = 500;
    }

    if (e.message) {
      error.message = e.message;
    }

    return error;
  }
};
