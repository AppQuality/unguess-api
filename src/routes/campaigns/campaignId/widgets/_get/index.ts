/** OPENAPI-CLASS: get-campaigns-cid-widgets-wslug */
import {
  getCampaign,
  getWidgetBugsByDevice,
  getWidgetBugsByDuplicates,
  getWidgetBugsByUseCase,
  getWidgetCampaignProgress,
} from "@src/utils/campaigns";
import getCampaignBugsTrend from "./uniqueBugsWidget/getCampaignBugsTrend";
import updateTrend from "./uniqueBugsWidget/updateTrend";
import getCampaignBugSituation from "./uniqueBugsWidget/getCampaignBugSituation";
import isGracePeriodPassed from "./uniqueBugsWidget/isGracePeriodPassed";
import CampaignRoute from "@src/features/routes/CampaignRoute";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-widgets-wslug"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-widgets-wslug"]["parameters"]["path"];
  query: StoplightOperations["get-campaigns-cid-widgets-wslug"]["parameters"]["query"];
}> {
  private widget: string | undefined;
  private updateTrend: boolean | undefined;

  protected async init(): Promise<void> {
    await super.init();

    const { s: widget, updateTrend } = this.getQuery();

    if (widget !== "unique-bugs" && updateTrend) {
      this.setError(422, {
        code: 400,
        message: "Invalid query parameter",
      } as OpenapiError);

      throw new Error("Invalid query parameter");
    }

    if (!this.cp_id || !widget) {
      this.setError(400, {
        code: 400,
        message: "Missing campaign id or widget slug",
      } as OpenapiError);

      throw new Error("Missing campaign id or widget slug");
    }

    this.widget = widget;
    this.updateTrend = updateTrend;
  }

  protected async prepare() {
    // Check if the campaign exists
    const campaign = await getCampaign({
      campaignId: this.cp_id,
      withOutputs: true,
    });

    if (!campaign) {
      this.setError(403, {
        code: 403,
        message:
          "Campaign doesn't exist or you don't have permission to view it",
      } as OpenapiError);

      throw new Error(
        "Campaign doesn't exist or you don't have permission to view it"
      );
    }

    // Return requested widget
    try {
      switch (this.widget) {
        case "bugs-by-usecase":
          return this.setSuccess(200, await getWidgetBugsByUseCase(campaign));
        case "bugs-by-device":
          return this.setSuccess(200, await getWidgetBugsByDevice(campaign));
        case "cp-progress":
          return this.setSuccess(
            200,
            await getWidgetCampaignProgress(campaign)
          );
        case "bugs-by-duplicates":
          return this.setSuccess(
            200,
            await getWidgetBugsByDuplicates(campaign)
          );
        case "unique-bugs":
          const { unique, total } = await getCampaignBugSituation(campaign);

          const trend = await getCampaignBugsTrend({
            campaignId: campaign.id,
            userId: this.getUser().unguess_wp_user_id,
            unique,
          });

          if (
            this.updateTrend &&
            (await isGracePeriodPassed({
              campaignId: campaign.id,
              userId: this.getUser().unguess_wp_user_id,
            }))
          ) {
            await updateTrend({
              campaignId: campaign.id,
              userId: this.getUser().unguess_wp_user_id,
              unique,
            });
          }
          return this.setSuccess(200, {
            data: { unique, total, trend },
            kind: "campaignUniqueBugs",
          });
      }
    } catch (e: any) {
      return this.setError(400, e as OpenapiError);
    }

    return this.setError(400, {
      code: 401,
      message: "The requested widget is not available or you don't have access",
    } as OpenapiError);
  }
}
