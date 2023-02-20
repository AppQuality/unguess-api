/** OPENAPI-CLASS: post-campaigns */

import {
  checkCampaignRequest,
  createCampaign,
  createUseCases,
} from "@src/utils/campaigns";
import { getProjectById } from "@src/utils/projects";
import {
  checkAvailableCoins,
  getExpressCost,
  getWorkspace,
  updateWorkspaceCoins,
  updateWorkspaceCoinsTransaction,
} from "@src/utils/workspaces";
import UserRoute from "@src/features/routes/UserRoute";
import * as db from "@src/features/db";

export default class Route extends UserRoute<{
  body: StoplightOperations["post-campaigns"]["requestBody"]["content"]["application/json"];
  response: StoplightOperations["post-campaigns"]["responses"]["200"]["content"]["application/json"];
}> {
  private CUSTOMER_TITLE_MAX_LENGTH = 256;

  protected async filter() {
    if (!(await super.filter())) return false;

    if (this.isCustomerTitleEmpty() || this.isBodyEmpty()) {
      this.setError(400, {} as OpenapiError);
      return false;
    }

    if (!(await this.isUserAuthorizedProject())) {
      this.setError(403, { message: "Something went wrong!" } as OpenapiError);
      return false;
    }

    return true;
  }

  protected async prepare() {
    try {
      let validated_request_body = await checkCampaignRequest(this.getBody());

      const workspace = await getWorkspace({
        workspaceId: validated_request_body.customer_id,
        user: this.getUser(),
      });

      const cost = await getExpressCost({
        slug: this.getBody().express_slug,
      });

      // Throw error if express is not defined
      if (cost === false) return this.setError(400, {} as OpenapiError);

      if (!checkAvailableCoins({ coins: workspace.coins, cost: cost }))
        return this.setError(403, {} as OpenapiError);

      // Create the campaign
      const campaign = await createCampaign(validated_request_body);

      await this.updateCoinPackages(cost, workspace.id, campaign.id);

      await this.addUseCases(campaign.id);
      this.setSuccess(200, campaign);
    } catch (error) {
      const err = error as OpenapiError;
      this.setError(err.code as number, err);
    }
  }

  private isCustomerTitleEmpty() {
    const { customer_title } = this.getBody();
    return (
      customer_title === undefined ||
      customer_title === "" ||
      customer_title.length > this.CUSTOMER_TITLE_MAX_LENGTH
    );
  }

  private isBodyEmpty() {
    return Object.keys(this.getBody()).length === 0;
  }

  private async isUserAuthorizedProject() {
    try {
      await getProjectById({
        user: this.getUser(),
        projectId: this.getBody().project_id,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  private async updateCoinPackages(
    cost: number,
    workspaceId: number,
    campaignId: number
  ) {
    let updatedCoinsPackages: StoplightComponents["schemas"]["Coin"][] = [];

    if (cost) {
      updatedCoinsPackages = await updateWorkspaceCoins({
        workspaceId: workspaceId,
        cost: cost,
      });
    }

    // Insert coins transaction
    if (updatedCoinsPackages.length) {
      for (const pack of updatedCoinsPackages) {
        await updateWorkspaceCoinsTransaction({
          workspaceId: workspaceId,
          user: this.getUser(),
          quantity: cost,
          campaignId: campaignId,
          ...(cost && { coinsPackageId: pack.id }),
        });
      }
    }
  }

  private async addUseCases(campaignId: number) {
    if (this.getBody().use_cases?.length) {
      const useCases = await createUseCases(this.getBody().use_cases);
      // Get useCases ids
      const useCasesIds = useCases.map((useCase) => useCase.id);
      if (useCasesIds.length > 0) {
        const updateSql = `UPDATE wp_appq_campaign_task SET campaign_id = ${campaignId} WHERE id IN (${useCasesIds.join(
          " ,"
        )})`;
        await db.query(updateSql);
      } else {
        this.setError(400, {
          message: "Something went wrong!",
        } as OpenapiError);
      }
    }
  }
}
