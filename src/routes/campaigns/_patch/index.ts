/** OPENAPI-ROUTE: patch-campaigns */
import { Context } from "openapi-backend";
import { ERROR_MESSAGE } from "@src/utils/constants";
import { editCampaign, getCampaign } from "@src/utils/campaigns";
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
  let request_body: StoplightComponents["requestBodies"]["Campaign"]["content"]["application/json"] =
    req.body;

  let cid = parseInt(c.request.params.cid as string);

  res.status_code = 200;

  try {
    // Check if cp exists
    const campaign = await getCampaign(cid);

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
};
