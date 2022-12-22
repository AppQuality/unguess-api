/** OPENAPI-CLASS: get-campaigns-cid-bugs */
import {
  DEFAULT_ORDER_BY_PARAMETER,
  DEFAULT_ORDER_PARAMETER,
  ERROR_MESSAGE,
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
} from "@src/utils/constants";
import { getCampaign, getCampaignBugs } from "@src/utils/campaigns";
import { getProjectById } from "@src/utils/projects";
import {
  BugsOrderByValues,
  BugsOrderValues,
} from "@src/utils/campaigns/getCampaignBugs";
import UserRoute from "@src/features/routes/UserRoute";

export default class BugsRoute extends UserRoute<{
  response: StoplightOperations["get-campaigns-cid-bugs"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-bugs"]["parameters"]["path"];
  query: StoplightOperations["get-campaigns-cid-bugs"]["parameters"]["query"];
}> {
  private cp_id: number;
  private prj_id?: number;
  private showNeedReview: boolean = false;
  private limit: number = LIMIT_QUERY_PARAM_DEFAULT;
  private start: number = START_QUERY_PARAM_DEFAULT;
  private order: string = DEFAULT_ORDER_PARAMETER;
  private orderBy: string = DEFAULT_ORDER_BY_PARAMETER;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);

    const params = this.getParameters();
    this.cp_id = parseInt(params.cid as string);

    const query = this.getQuery();
    if (query.limit) this.limit = parseInt(query.limit as unknown as string);
    if (query.start) this.start = parseInt(query.start as unknown as string);

    if (query.order && BugsOrderValues.includes(query.order))
      this.order = query.order;
    if (query.orderBy && BugsOrderByValues.includes(query.orderBy))
      this.orderBy = query.orderBy;
  }

  protected async init(): Promise<void> {
    const campaign = await getCampaign({ campaignId: this.cp_id });

    if (!campaign) {
      this.setError(400, {
        code: 400,
        message: "Campaign not found",
      } as OpenapiError);

      throw new Error("Campaign not found");
    }

    this.prj_id = campaign.project.id;
    this.showNeedReview = campaign.showNeedReview;
  }

  private getProjectId(): number {
    if (!this.prj_id) {
      this.setError(400, {
        code: 400,
        message: "Project not defined",
      } as OpenapiError);
      throw new Error("Project not defined");
    }

    return this.prj_id;
  }

  private shouldShowNeedReview(): boolean {
    if (this.getUser().role === "administrator") return true;

    return this.showNeedReview;
  }

  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) return false;
    // Check if user has permission to edit the campaign
    try {
      await getProjectById({
        projectId: this.getProjectId(),
        user: this.getUser(),
      });
    } catch (error) {
      this.setError(403, {
        code: 400,
        message: "Project not found",
      } as OpenapiError);
      return false;
    }

    return true;
  }

  protected async prepare(): Promise<void> {
    const req = this.configuration.request;

    try {
      // Check if the campaign exists

      // Get the campaign bugs
      const bugs = await getCampaignBugs({
        campaignId: this.cp_id,
        user: this.getUser(),
        showNeedReview: this.shouldShowNeedReview(),
        limit: this.limit,
        start: this.start,
        order: this.order,
        orderBy: this.orderBy,
        ...(req.query.filterBy !== undefined && {
          filterBy: req.query.filterBy as { [key: string]: string | string[] },
        }),
      });

      if (bugs && bugs.length) {
        return this.setSuccess(200, {
          items: bugs,
          start: this.start,
          limit: this.limit,
          size: bugs.length,
          total: bugs.length,
        });
      }

      return this.setSuccess(200, {
        items: [],
        start: this.start,
        limit: this.limit,
        size: 0,
        total: 0,
      });
    } catch (e: any) {
      return this.setError(e.code || 500, {
        message: e.message || ERROR_MESSAGE,
        status_code: e.code || 500,
      } as OpenapiError);
    }
  }
}
