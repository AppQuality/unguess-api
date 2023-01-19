/** OPENAPI-CLASS: get-campaigns-cid-bugs */
import {
  DEFAULT_ORDER_BY_PARAMETER,
  DEFAULT_ORDER_PARAMETER,
  ERROR_MESSAGE,
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
} from "@src/utils/constants";
import { getBugTitle, getTitleRule } from "@src/utils/campaigns/getTitleRule";
import { getBugDevice } from "@src/utils/bugs/getBugDevice";

import * as db from "@src/features/db";
import CampaignRoute from "@src/features/routes/CampaignRoute";

interface Tag {
  tag_id: number;
  tag_name: string;
}

export default class BugsRoute extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-bugs"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-bugs"]["parameters"]["path"];
  query: StoplightOperations["get-campaigns-cid-bugs"]["parameters"]["query"];
}> {
  private limit: number = LIMIT_QUERY_PARAM_DEFAULT;
  private start: number = START_QUERY_PARAM_DEFAULT;
  private order: string = DEFAULT_ORDER_PARAMETER;
  private orderBy: string = DEFAULT_ORDER_BY_PARAMETER;

  private isTitleRuleActive: boolean = false;
  private tags: (Tag & { bug_id: number })[] = [];
  private filterBy: { [key: string]: string | string[] } | undefined;
  private filterByTags: number[] | "none" | undefined;
  private search: string | undefined;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);

    const query = this.getQuery();
    if (query.limit) this.limit = parseInt(query.limit as unknown as string);
    if (query.start) this.start = parseInt(query.start as unknown as string);

    this.setOrder();
    this.setOrderBy();

    if (query.filterBy)
      this.filterBy = query.filterBy as { [key: string]: string | string[] };

    if (query.search) this.search = query.search as string;
  }

  private setOrderBy() {
    const query = this.getQuery();
    if (query.orderBy && ["severity_id"].includes(query.orderBy))
      this.orderBy = query.orderBy;
  }

  private setOrder() {
    const query = this.getQuery();
    if (query.order && ["ASC", "DESC"].includes(query.order))
      this.order = query.order;
  }

  protected async init(): Promise<void> {
    await super.init();
    this.isTitleRuleActive = await this.getTitleRuleStatus();
    this.tags = await this.getTags();

    this.initFilterByTags();
  }

  private initFilterByTags() {
    const tags = this.tags;
    if (
      this.filterBy &&
      this.filterBy["tags"] &&
      typeof this.filterBy["tags"] === "string"
    ) {
      if (this.filterBy["tags"] === "none") {
        this.filterByTags = "none";
      } else {
        this.filterByTags = this.filterBy["tags"]
          .split(",")
          .map((tagId) => (parseInt(tagId) > 0 ? parseInt(tagId) : 0))
          .filter((tagId) => tags.map((t) => t.tag_id).includes(tagId));
      }
    }
  }

  protected async prepare(): Promise<void> {
    let bugs;
    try {
      bugs = await this.getBugs();
    } catch (e: any) {
      return this.setError(500, {
        message: e.message || ERROR_MESSAGE,
        status_code: 500,
      } as OpenapiError);
    }

    if (!bugs || !bugs.length) return this.emptyResponse();

    const enhancedBugs = this.enhanceBugs(bugs);
    const filtered = this.filterBugs(enhancedBugs);
    const paginated = this.paginateBugs(filtered);
    const formatted = this.formatBugs(paginated);

    return this.setSuccess(200, {
      items: formatted,
      start: this.start,
      limit: this.limit,
      size: formatted.length,
      total: filtered.length,
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
        read: true | false;
        tags?: Tag[];
      }[]
  > {
    const bugs = await db.query(
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
      WHERE b.campaign_id = ${this.cp_id}
      AND b.publish = 1
      AND ${
        this.shouldShowNeedReview()
          ? `(status.name = 'Approved' OR status.name = 'Need Review')`
          : `status.name = 'Approved'`
      }
      ORDER BY b.${this.orderBy} ${this.order}`
    );

    if (!bugs) return false;

    return bugs;
  }

  private enhanceBugs(bugs: Awaited<ReturnType<typeof this.getBugs>>) {
    if (!bugs || !bugs.length) return [];

    return bugs.map((bug) => {
      let tags;
      if (this.tags.length) {
        tags = this.tags
          .filter((tag) => tag.bug_id === bug.id)
          .map((tag) => ({
            tag_id: tag.tag_id,
            tag_name: tag.tag_name,
          }));
        if (!tags.length) tags = undefined;
      }
      return {
        ...bug,
        title: getBugTitle({
          bugTitle: bug.title,
          hasTitleRule: this.isTitleRuleActive,
        }),
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
        application_section: {
          id: bug.application_section_id,
          title: bug.uc_title ?? bug.application_section,
          ...(bug.uc_simple_title && { simple_title: bug.uc_simple_title }),
          ...(bug.uc_prefix && { prefix: bug.uc_prefix }),
        },
        device: getBugDevice(bug),
        ...(tags && { tags }),
      };
    });
  }

  private formatBugs(bugs: ReturnType<typeof this.paginateBugs>) {
    return bugs.map((bug) => {
      return {
        id: bug.id,
        internal_id: bug.internal_id,
        campaign_id: bug.campaign_id,
        title: bug.title,
        step_by_step: bug.description,
        expected_result: bug.expected_result,
        current_result: bug.current_result,
        status: bug.status,
        severity: bug.severity,
        type: bug.type,
        replicability: bug.replicability,
        application_section: bug.application_section,
        created: bug.created.toString(),
        ...(bug.updated && { updated: bug.updated.toString() }),
        ...(bug.duplicated_of_id && { duplicated_of_id: bug.duplicated_of_id }),
        note: bug.note,
        device: bug.device,
        is_favorite: bug.is_favorite,
        is_duplicated: bug.is_duplicated,
        read: bug.read_status ? true : false,
        tags: bug.tags,
      };
    });
  }

  private filterBugs(bugs: ReturnType<typeof this.enhanceBugs>) {
    if (!this.filterBy && !this.search) return bugs;

    return bugs.filter((bug) => {
      if (this.filterBugsByReadStatus(bug) === false) return false;
      if (this.filterBugsByDuplicateStatus(bug) === false) return false;
      if (this.filterBugsByTags(bug) === false) return false;
      if (this.filterBugsBySeverity(bug) === false) return false;
      if (this.filterBugsByReplicability(bug) === false) return false;
      if (this.filterBugsByType(bug) === false) return false;
      if (this.filterBugsByUsecase(bug) === false) return false;
      if (this.filterBugsByDevice(bug) === false) return false;
      if (this.filterBugsByOs(bug) === false) return false;
      if (this.filterBugsBySearch(bug) === false) return false;

      return true;
    });
  }

  private filterBugsByUsecase(
    bug: Parameters<typeof this.filterBugs>[0][number]
  ) {
    if (!this.filterBy) return true;
    if (!this.filterBy["usecases"]) return true;
    if (typeof this.filterBy["usecases"] !== "string") return true;

    const usecasesIds = this.filterBy["usecases"]
      .split(",")
      .map((id) => parseInt(id));
    return usecasesIds.includes(bug.application_section.id);
  }

  private filterBugsByDevice(
    bug: Parameters<typeof this.filterBugs>[0][number]
  ) {
    if (!this.filterBy) return true;
    if (!this.filterBy["devices"]) return true;
    if (typeof this.filterBy["devices"] !== "string") return true;

    const devices = this.filterBy["devices"].split(",");

    return devices.some((device) => {
      return (
        device === `${bug.manufacturer} ${bug.model}` ||
        ("desktop_type" in bug.device && device === bug.device.desktop_type)
      );
    });
  }

  private filterBugsByOs(bug: Parameters<typeof this.filterBugs>[0][number]) {
    if (!this.filterBy) return true;
    if (!this.filterBy["os"]) return true;
    if (typeof this.filterBy["os"] !== "string") return true;

    const operatingSystems = this.filterBy["os"].split(",");

    return operatingSystems.some((os) => {
      return os.localeCompare(`${bug.os} ${bug.os_version}`) === 0;
    });
  }

  private filterBugsByReadStatus(
    bug: Parameters<typeof this.filterBugs>[0][number]
  ) {
    if (!this.filterBy) return true;
    if (!this.filterBy["read"]) return true;

    if (this.filterBy["read"] === "false") return bug.read_status === 0;
    return bug.read_status === 1;
  }

  private filterBugsByDuplicateStatus(
    bug: Parameters<typeof this.filterBugs>[0][number]
  ) {
    if (!this.filterBy) return true;
    if (!this.filterBy["is_duplicated"]) return true;

    return bug.is_duplicated.toString() === this.filterBy["is_duplicated"];
  }

  private filterBugsByTags(bug: Parameters<typeof this.filterBugs>[0][number]) {
    if (!this.filterByTags) return true;
    if (!this.filterByTags.length) return true;

    if (this.filterByTags === "none") return !bug.tags?.length;

    if (!bug.tags?.length) return false;

    const bugTagsIds = bug.tags.map((tag) => tag.tag_id);
    return this.filterByTags.every((tag) => bugTagsIds.includes(tag));
  }

  private filterBugsBySeverity(
    bug: Parameters<typeof this.filterBugs>[0][number]
  ) {
    if (!this.filterBy) return true;
    if (!this.filterBy["severities"]) return true;
    if (typeof this.filterBy["severities"] !== "string") return true;

    const severitiesToFilter = this.filterBy["severities"]
      .split(",")
      .map((sevId) => (parseInt(sevId) > 0 ? parseInt(sevId) : 0))
      .filter((sevId) => sevId > 0);

    return severitiesToFilter.includes(bug.severity.id);
  }

  private filterBugsByType(bug: Parameters<typeof this.filterBugs>[0][number]) {
    if (!this.filterBy) return true;
    if (!this.filterBy["types"]) return true;
    if (typeof this.filterBy["types"] !== "string") return true;

    const typesToFilter = this.filterBy["types"]
      .split(",")
      .map((id) => (parseInt(id) > 0 ? parseInt(id) : 0))
      .filter((id) => id > 0);

    return typesToFilter.includes(bug.type.id);
  }

  private filterBugsByReplicability(
    bug: Parameters<typeof this.filterBugs>[0][number]
  ) {
    if (!this.filterBy) return true;
    if (!this.filterBy["replicabilities"]) return true;
    if (typeof this.filterBy["replicabilities"] !== "string") return true;

    const replicabilitiesToFilter = this.filterBy["replicabilities"]
      .split(",")
      .map((repId) => (parseInt(repId) > 0 ? parseInt(repId) : 0))
      .filter((repId) => repId > 0);

    return replicabilitiesToFilter.includes(bug.replicability.id);
  }

  private filterBugsBySearch(
    bug: Parameters<typeof this.filterBugs>[0][number]
  ) {
    if (!this.search) return true;
    if (this.search.length <= 0) return true;

    if (this.filterBugsBySearchById(bug) === true) return true;

    return bug.title.full
      .toLocaleLowerCase()
      .includes(this.search.toLocaleLowerCase());
  }

  private filterBugsBySearchById(
    bug: Parameters<typeof this.filterBugs>[0][number]
  ) {
    if (!this.search) return true;

    const textToSearch = this.search.replace(this.baseBugInternalId, "");
    if (bug.id.toString().includes(textToSearch)) return true;

    return false;
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
