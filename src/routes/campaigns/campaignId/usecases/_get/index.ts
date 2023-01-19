/** OPENAPI-CLASS: get-campaigns-cid-usecases */

import UserRoute from "@src/features/routes/UserRoute";
import { getCampaign } from "@src/utils/campaigns";
import { ERROR_MESSAGE } from "@src/utils/constants";
import { getProjectById } from "@src/utils/projects";

export default class Route extends UserRoute<{
  response: StoplightOperations["get-campaigns-cid-usecases"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-usecases"]["parameters"]["path"];
}> {
  private cid: number;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    const params = this.getParameters();
    this.cid = params.cid;
  }

  protected async filter(): Promise<boolean> {
    if (!super.filter()) return false;

    const campaign = await getCampaign({ campaignId: this.cid });

    if (!campaign) {
      this.setError(400, {
        status_code: 400,
        message: ERROR_MESSAGE,
      } as OpenapiError);
      return false;
    }
    try {
      // Check if user has permission to edit the campaign
      await getProjectById({
        projectId: campaign.project.id,
        user: this.getUser(),
      });
    } catch (e) {
      this.setError(403, {
        message: ERROR_MESSAGE,
      } as OpenapiError);
      return false;
    }
    return true;
  }

  protected async prepare(): Promise<void> {
    const campaignUsecases = [
      {
        id: 1,
        title: { full: "Usecase 1" },
        description: "usecase description",
        bugs: 19,
      },
    ];
    return this.setSuccess(200, campaignUsecases);
  }
}
