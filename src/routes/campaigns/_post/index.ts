/** OPENAPI-ROUTE: post-campaigns */
import { Context } from "openapi-backend";
import { ERROR_MESSAGE } from "@src/utils/constants";
import {
  checkCampaignRequest,
  createCampaign,
  createUseCases,
} from "@src/utils/campaigns";
import { getProjectById } from "@src/utils/projects";
import { checkAvailableCoins, getExpressCost } from "@src/utils/workspaces";
import { getWorkspace } from "@src/utils/workspaces";
import { updateWorkspaceCoins } from "@src/utils/workspaces";
import { updateWorkspaceCoinsTransaction } from "@src/utils/workspaces";

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

    // Get express cost based on express slug
    const cost = await getExpressCost({
      slug: validated_request_body.express_slug,
    });

    // Throw error if express is not defined
    if (cost === false) throw { ...error, code: 400 };

    // Check express coins availability
    if (!checkAvailableCoins({ coins: workspace.coins, cost: cost }))
      throw { ...error, code: 403 };

    // Deduct express coin(s) if express is not free (has cost)
    let coinsPackageId;
    if (cost) {
      const updatedCoinsPackages = await updateWorkspaceCoins({
        workspaceId: workspace.id,
        cost: cost,
      });

      const updatedCoinsPackage = updatedCoinsPackages[0];
      coinsPackageId = updatedCoinsPackage.id;
    }

    if (request_body.use_cases) {
      const useCases = await createUseCases(request_body.use_cases);
    }

    // Create the campaign
    let campaign = await createCampaign(validated_request_body);

    // Insert coins transaction
    await updateWorkspaceCoinsTransaction({
      workspaceId: workspace.id,
      profileId: user.id,
      quantity: cost,
      campaignId: campaign.id,
      ...(cost && { coinsPackageId: coinsPackageId }),
    });

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
