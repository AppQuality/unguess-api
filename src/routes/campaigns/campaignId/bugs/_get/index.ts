/** OPENAPI-CLASS: get-campaigns-cid-bugs */
import {
  DEFAULT_ORDER_BY_PARAMETER,
  DEFAULT_ORDER_PARAMETER,
  ERROR_MESSAGE,
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
} from "@src/utils/constants";
import { getCampaign } from "@src/utils/campaigns";
import { getProjectById } from "@src/utils/projects";
import {
  BugsOrderByValues,
  BugsOrderValues,
} from "@src/utils/campaigns/getCampaignBugs";
import UserRoute from "@src/features/routes/UserRoute";
import { getBugTitle, getTitleRule } from "@src/utils/campaigns/getTitleRule";
import { getBugDevice } from "@src/utils/bugs/getBugDevice";

import * as db from "@src/features/db";

export default class BugsRoute extends UserRoute<{
  response: StoplightOperations["get-campaigns-cid-bugs"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-bugs"]["parameters"]["path"];
  query: StoplightOperations["get-campaigns-cid-bugs"]["parameters"]["query"];
}> {
  private cp_id: number;
  private limit: number = LIMIT_QUERY_PARAM_DEFAULT;
  private start: number = START_QUERY_PARAM_DEFAULT;
  private order: string = DEFAULT_ORDER_PARAMETER;
  private orderBy: string = DEFAULT_ORDER_BY_PARAMETER;

  private campaign:
    | { project: number; showNeedReview: boolean; titleRule: boolean }
    | undefined;
  private filterBy: { [key: string]: string | string[] } | undefined;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);

    const { cid } = this.getParameters();
    this.cp_id = parseInt(cid);

    const query = this.getQuery();
    if (query.limit) this.limit = parseInt(query.limit as unknown as string);
    if (query.start) this.start = parseInt(query.start as unknown as string);

    if (query.order && BugsOrderValues.includes(query.order))
      this.order = query.order;
    if (query.orderBy && BugsOrderByValues.includes(query.orderBy))
      this.orderBy = query.orderBy;

    if (query.filterBy)
      this.filterBy = query.filterBy as { [key: string]: string | string[] };
  }

  private getCampaign() {
    if (!this.campaign) throw new Error("Project not defined");
    return this.campaign;
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

    this.campaign = {
      project: campaign.project.id,
      showNeedReview: campaign.showNeedReview,
      titleRule: await getTitleRule(this.cp_id),
    };
  }

  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) return false;

    try {
      await getProjectById({
        projectId: this.getCampaign().project,
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
    let bugs;
    try {
      bugs = await this.getBugs();
    } catch (e: any) {
      return this.setError(e.code || 500, {
        message: e.message || ERROR_MESSAGE,
        status_code: e.code || 500,
      } as OpenapiError);
    }

    if (!bugs || !bugs.length) return this.emptyResponse();

    const formatted = this.formatBugs(bugs);
    const filtered = this.filterBugs(formatted);
    const paginated = this.paginateBugs(filtered);
    return this.setSuccess(200, {
      items: paginated,
      start: this.start,
      limit: this.limit,
      size: bugs.length,
      total: bugs.length,
    });
  }

  private async getBugs(): Promise<
    | false
    | {
        id: number;
        internal_id: string;
        campaign_id: number;
        title: string;
        description: string;
        expected_result: string;
        current_result: string;
        status_id: number;
        status_name: string;
        severity: string;
        type: string;
        replicability: string;
        created: string;
        updated: string;
        note: string;
        form_factor: string;
        pc_type: string;
        manufacturer: string;
        model: string;
        os: string;
        os_version: string;
        application_section: string;
        application_section_id: number;
        uc_title: string;
        uc_simple_title: string;
        uc_prefix: string;
        is_duplicated: 0 | 1;
        duplicated_of_id: number;
        is_favorite: 0 | 1;
        bug_replicability_id: number;
        bug_type_id: number;
        severity_id: number;
        read_status: 0 | 1;
      }[]
  > {
    const bugs = await db.query(
      db.format(
        `SELECT 
    b.id,
    b.internal_id,
    b.campaign_id,
    b.message     AS title,
    b.description,
    b.expected_result,
    b.current_result,
    b.status_id,
    status.name   AS status_name,
    s.name        AS severity,
    t.name        AS type,
    r.name        AS replicability,
    b.created,
    b.updated,
    b.note,
    device.form_factor,
    device.pc_type,
    b.manufacturer,
    b.model,
    b.os,
    b.os_version,
    b.application_section,
    b.application_section_id,
    uc.title as uc_title,
    uc.simple_title as uc_simple_title,
    uc.prefix as uc_prefix,
    b.is_duplicated,
    b.duplicated_of_id,
    b.is_favorite,
    b.bug_replicability_id,
    b.bug_type_id,
    b.severity_id,
    COALESCE(rs.is_read, 0) as read_status
  FROM wp_appq_evd_bug b
  JOIN wp_appq_evd_severity s ON (b.severity_id = s.id)
  JOIN wp_appq_evd_bug_type t ON (b.bug_type_id = t.id)
  JOIN wp_appq_evd_bug_replicability r ON (b.bug_replicability_id = r.id)
  JOIN wp_appq_evd_bug_status status ON (b.status_id = status.id)
  LEFT JOIN wp_crowd_appq_device device ON (b.dev_id = device.id)
  LEFT JOIN wp_appq_campaign_task uc ON (uc.id = b.application_section_id)
  LEFT JOIN wp_appq_bug_read_status rs ON (rs.bug_id = b.id AND rs.is_read = 1 AND rs.wp_id = ${this.getWordpressId(
    "tryber"
  )})
  WHERE b.campaign_id = ?
  AND b.publish = 1
  AND ${
    this.shouldShowNeedReview()
      ? `(status.name = 'Approved' OR status.name = 'Need Review')`
      : `status.name = 'Approved'`
  }
  ORDER BY b.${this.orderBy} ${this.order}`,
        [this.cp_id]
      )
    );

    if (!bugs) return false;

    return bugs;
  }

  private shouldShowNeedReview(): boolean {
    if (this.getUser().role === "administrator") return true;
    return this.getCampaign().showNeedReview;
  }

  private formatBugs(bugs: Awaited<ReturnType<typeof this.getBugs>>) {
    if (!bugs || !bugs.length) return [];
    return bugs.map((bug) => {
      return {
        id: bug.id,
        internal_id: bug.internal_id,
        campaign_id: bug.campaign_id,
        title: getBugTitle({
          bugTitle: bug.title,
          hasTitleRule: this.getCampaign().titleRule,
        }),
        step_by_step: bug.description,
        expected_result: bug.expected_result,
        current_result: bug.current_result,
        status: {
          id: bug.status_id,
          name: bug.status_name,
        },
        severity: {
          id: bug.severity_id,
          name: bug.severity,
        },
        type: {
          id: bug.bug_type_id,
          name: bug.type,
        },
        replicability: {
          id: bug.bug_replicability_id,
          name: bug.replicability,
        },
        application_section: this.getBugUseCase(bug),
        created: bug.created.toString(),
        ...(bug.updated && { updated: bug.updated.toString() }),
        note: bug.note,
        device: getBugDevice(bug),
        ...(bug.duplicated_of_id && { duplicated_of_id: bug.duplicated_of_id }),
        is_favorite: bug.is_favorite,
        read_status: bug.read_status,
        is_duplicated: bug.is_duplicated,
      };
    });
  }

  private getBugUseCase(bug: {
    application_section: string;
    application_section_id: number;
    uc_title?: string;
    uc_simple_title?: string;
    uc_prefix?: string;
  }) {
    return {
      id: bug.application_section_id,
      title: bug.uc_title ?? bug.application_section,
      ...(bug.uc_simple_title && { simple_title: bug.uc_simple_title }),
      ...(bug.uc_prefix && { prefix: bug.uc_prefix }),
    };
  }

  private filterBugs(bugs: ReturnType<typeof this.formatBugs>) {
    if (!this.filterBy) return bugs;
    return bugs.filter((bug) => {
      if (this.filterBy && this.filterBy["unread"]) {
        return bug.read_status === 0;
      }
      if (this.filterBy && this.filterBy["is_duplicated"]) {
        return bug.is_duplicated.toString() === this.filterBy["is_duplicated"];
      }
      return true;
    });
  }

  private paginateBugs(bugs: ReturnType<typeof this.filterBugs>) {
    if (!this.limit) return bugs;
    return bugs.slice(this.start, this.start + this.limit);
  }

  private emptyResponse() {
    return this.setSuccess(200, {
      items: [],
      start: this.start,
      limit: this.limit,
      size: 0,
      total: 0,
    });
  }
}
