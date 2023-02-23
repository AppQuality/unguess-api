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
  private _validatedBody:
    | Awaited<ReturnType<typeof checkCampaignRequest>>
    | undefined;
  private _workspaceId: number | undefined;
  private _cost: number | false = false;
  private availableCoins: number = 0;

  protected async init() {
    await super.init();
    try {
      this._validatedBody = await checkCampaignRequest(this.getBody());
      if (!this._validatedBody) throw new Error("Invalid request body");

      const workspace = await getWorkspace({
        workspaceId: this._validatedBody.customer_id,
        user: this.getUser(),
      });
      this._workspaceId = workspace.id;
      this.availableCoins = workspace.coins || 0;
      this._cost = await getExpressCost({
        slug: this.getBody().express_slug,
      });
    } catch (error) {
      const err = error as OpenapiError;
      this.setError(err.code as number, err);
      throw error;
    }
  }

  get validatedBody() {
    if (typeof this._validatedBody === "undefined")
      throw new Error("Invalid request body");
    return this._validatedBody;
  }

  get workspaceId() {
    if (typeof this._workspaceId === "undefined")
      throw new Error("Invalid workspace id");
    return this._workspaceId;
  }

  get cost() {
    if (this._cost === false) throw new Error("Invalid cost");
    return this._cost;
  }

  get isFree() {
    return this.cost === 0;
  }

  protected async filter() {
    if (!(await super.filter())) return false;

    if (!(await this.isUserAuthorizedProject())) {
      this.setError(403, { message: "Something went wrong!" } as OpenapiError);
      return false;
    }

    if (!(await this.isCostValid())) {
      this.setError(403, { message: "Something went wrong!" } as OpenapiError);
      return false;
    }

    return true;
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

  private async isCostValid() {
    try {
      return checkAvailableCoins({
        coins: this.availableCoins,
        cost: this.cost,
      });
    } catch (e) {
      return false;
    }
  }

  protected async prepare() {
    const campaign = await createCampaign(this.validatedBody);

    await this.updateCoinPackages(campaign.id);

    try {
      await this.addUseCases(campaign.id);
    } catch (e) {
      this.setError(400, e as OpenapiError);
    }
    this.setSuccess(200, campaign);
  }

  private async updateCoinPackages(campaignId: number) {
    if (this.isFree) return;

    const updatedCoinsPackages = await updateWorkspaceCoins({
      workspaceId: this.workspaceId,
      cost: this.cost,
    });

    for (const pack of updatedCoinsPackages) {
      await updateWorkspaceCoinsTransaction({
        workspaceId: this.workspaceId,
        user: this.getUser(),
        quantity: this.cost,
        campaignId: campaignId,
        coinsPackageId: pack.id,
      });
    }
  }

  private async addUseCases(campaignId: number) {
    if (!this.getBody().use_cases?.length) return;

    const useCases = await createUseCases(this.getBody().use_cases);
    if (useCases.length === 0) throw new Error("Something went wrong!");
    const useCasesIds = useCases.map((useCase) => useCase.id);
    await db.query(
      `UPDATE wp_appq_campaign_task 
      SET campaign_id = ${campaignId} 
      WHERE id IN (${useCasesIds.join(" ,")})`
    );
  }
}
