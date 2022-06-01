/** OPENAPI-ROUTE: post-campaigns */
import { Context } from "openapi-backend";
import { ERROR_MESSAGE } from "@src/utils/consts";
import { checkCampaignRequest } from "@src/utils/checkCampaignRequest";
import { getProjectById } from "@src/utils/getProjectById";
import { createCampaign } from "@src/utils/createCampaign";

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

  res.status_code = 200;

  try {
    // Check request
    let validated_request_body = await checkCampaignRequest(request_body);

    // Try to get the project checking all the permissions
    await getProjectById(validated_request_body.project_id, user);

    // Create the campaign
    let campaign = await createCampaign(validated_request_body);

    return campaign as StoplightComponents["schemas"]["Campaign"];
  } catch (e: any) {
    console.error(e);

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
