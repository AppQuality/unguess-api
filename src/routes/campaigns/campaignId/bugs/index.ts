/** OPENAPI-ROUTE: get-campaigns-cid-bugs */
import { Context } from "openapi-backend";
import {
  ERROR_MESSAGE,
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
} from "@src/utils/constants";
import { getCampaign, getCampaignBugs } from "@src/utils/campaigns";
import { getProjectById } from "@src/utils/projects";
import { BugsOrder, BugsOrderBy } from "@src/utils/campaigns/getCampaignBugs";
import { paginateItems } from "@src/utils/paginations";

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

  const limit = c.request.query.limit
    ? parseInt(c.request.query.limit as string)
    : (LIMIT_QUERY_PARAM_DEFAULT as StoplightComponents["parameters"]["limit"]);
  const start = c.request.query.start
    ? parseInt(c.request.query.start as string)
    : (START_QUERY_PARAM_DEFAULT as StoplightComponents["parameters"]["start"]);

  const order =
    c.request.query.order &&
    ["ASC", "DESC"].includes((c.request.query.order as string).toUpperCase())
      ? ((c.request.query.order as string).toUpperCase() as BugsOrder)
      : "ASC";

  const orderBy =
    c.request.query.orderBy &&
    ["id", "company", "tokens"].includes(
      (c.request.query.orderBy as string).toLowerCase()
    )
      ? ((c.request.query.orderBy as string).toLowerCase() as BugsOrderBy)
      : "id";

  res.status_code = 200;

  try {
    // Check if the campaign exists
    let campaign = await getCampaign({ campaignId: cid });

    if (!campaign) {
      error.code = 400;
      throw error;
    }

    // Check if user has permission to edit the campaign
    await getProjectById({
      projectId: campaign.project.id,
      user: user,
    });

    // Get the campaign bugs
    const bugs = await getCampaignBugs({ campaignId: cid });

    if (bugs && bugs.length) {
      return await paginateItems({
        items: bugs,
        limit,
        start,
        total: bugs.length,
      });
    }

    return await paginateItems({ items: [], total: 0 });
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