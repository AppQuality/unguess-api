/** OPENAPI-CLASS: patch-campaigns-cid-bugs-bid */
import { ERROR_MESSAGE } from "@src/utils/constants";
import { getCampaign } from "@src/utils/campaigns";
import UserRoute from "@src/features/routes/UserRoute";
import { getProjectById } from "@src/utils/projects";
import { getBugById } from "@src/utils/bugs";

export default class Route extends UserRoute<{
  parameters: StoplightOperations["patch-campaigns-cid-bugs-bid"]["parameters"]["path"];
  // body: StoplightOperations["patch-campaigns-cid-bugs-bid"]["requestBody"]["content"]["application/json"];
  // response: StoplightOperations["patch-campaigns-cid-bugs-bid"]["responses"]["200"]["content"]["application/json"];
}> {
  private cid: number;
  private bid: number;
  // public tags: ({ tag_id?: number } | { tag_name?: string })[] | undefined;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    const params = this.getParameters();
    this.cid = parseInt(params.cid);
    this.bid = parseInt(params.bid);
    // this.tags = this.getBody().tags;
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
      await getBugById({ bugId: this.bid });
    } catch (e) {
      this.setError(400, {
        status_code: 400,
        message: ERROR_MESSAGE,
      } as OpenapiError);
      return false;
    }

    // try {
    //   // Check if user has permission to edit the campaign
    //   await getProjectById({
    //     projectId: campaign.project.id,
    //     user: this.getUser(),
    //   });
    // } catch (e) {
    //   this.setError(403, {
    //     message: ERROR_MESSAGE,
    //   } as OpenapiError);
    //   return false;
    // }
    return true;
  }
}
