/** OPENAPI-ROUTE: post-campaigns */
import { Context } from "openapi-backend";
import { ERROR_MESSAGE } from "@src/utils/constants";
import { checkCampaignRequest, createCampaign } from "@src/utils/campaigns";
import { getProjectById } from "@src/utils/projects";
import { checkAvailableCoins } from "@src/utils/workspaces/checkAvailableCoins";
import { getWorkspace } from "@src/utils/workspaces";

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
    await getProjectById({
      user: user,
      projectId: validated_request_body.project_id,
    });

    // Retrieve and check workspace
    const workspace = await getWorkspace({
      workspaceId: request_body.customer_id,
      user: user,
    });

    // Check express coins availability
    if (!checkAvailableCoins({ coins: workspace.coins }))
      throw { ...error, code: 403 };

    // Create the campaign
    let campaign = await createCampaign(validated_request_body);

    //Deduct express coin(s)

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
