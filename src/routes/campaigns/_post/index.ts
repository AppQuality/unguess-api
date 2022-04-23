/** OPENAPI-ROUTE: post-campaigns */
import { Context } from "openapi-backend";
import { ERROR_MESSAGE } from "@src/routes/shared";
import checkCampaignRequest from "../checkCampaignRequest";
import getProjectById from "@src/routes/projects/projectId/getProjectById";
import createCampaign from "../createCampaign";

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

    console.log("Request validated");

    // Try to get the project checking all the permissions
    await getProjectById(validated_request_body.project_id, user);

    // Create the campaign
    let campaign = await createCampaign(validated_request_body);

    return campaign as StoplightComponents["schemas"]["Campaign"];
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
