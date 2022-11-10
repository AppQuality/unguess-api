import * as db from "@src/features/db";
import { getBugDevice } from "@src/utils/bugs/getBugDevice";
import { START_QUERY_PARAM_DEFAULT } from "@src/utils/constants";
import { getBugTitle, getTitleRule } from "@src/utils/campaigns/getTitleRule";

interface GetCampaignBugsArgs {
  campaignId: number;
  showNeedReview: boolean;
  limit?: StoplightComponents["parameters"]["limit"];
  start?: StoplightComponents["parameters"]["start"];
  order?: string;
  orderBy?: string;
  filterBy?: BugsFilterBy;
}

interface BugsFilterBy {
  [key: string]: string | string[];
}

export const BugsOrderByValues = [
  "id",
  "internal_id",
  "wp_user_id",
  "campaign_id",
  "status_id",
  "publish",
  "severity_id",
  "bug_replicability_id",
  "bug_type_id",
  "dev_id",
  "manufacturer",
  "model",
  "os",
  "os_version",
  "is_duplicated",
  "duplicated_of_id",
  "is_favorite",
  "created",
  "updated",
  "last_seen",
];
export const BugsOrderValues = ["ASC", "DESC"];
export const BugsFilterByValues = [
  "id",
  "internal_id",
  "wp_user_id",
  "status_id",
  "publish",
  "severity_id",
  "bug_replicability_id",
  "bug_type_id",
  "dev_id",
  "manufacturer",
  "model",
  "os",
  "os_version",
  "is_duplicated",
  "duplicated_of_id",
  "is_favorite",
];

export const getCampaignBugs = async (
  args: GetCampaignBugsArgs
): Promise<StoplightComponents["schemas"]["Bug"][] | false> => {
  const { campaignId, showNeedReview, limit, start, order, orderBy, filterBy } =
    args;

  const queryData: string[] = [];
  queryData.push(campaignId.toString());

  let query = `SELECT 
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
    b.is_duplicated,
    b.duplicated_of_id,
    b.is_favorite,
    b.bug_replicability_id,
    b.bug_type_id,
    b.severity_id
  FROM wp_appq_evd_bug b
  JOIN wp_appq_evd_severity s ON (b.severity_id = s.id)
  JOIN wp_appq_evd_bug_type t ON (b.bug_type_id = t.id)
  JOIN wp_appq_evd_bug_replicability r ON (b.bug_replicability_id = r.id)
  JOIN wp_appq_evd_bug_status status ON (b.status_id = status.id)
  LEFT JOIN wp_crowd_appq_device device ON (b.dev_id = device.id)
  WHERE b.campaign_id = ? 
  AND ${
    showNeedReview
      ? `(status.name == 'Approved' OR status.name == 'Need Review')`
      : `status.name == 'Approved'`
  }`;

  if (filterBy) {
    let acceptedFilters = BugsFilterByValues.filter((f) =>
      Object.keys(filterBy).includes(f)
    );

    // Check filters
    if (acceptedFilters.length) {
      acceptedFilters = acceptedFilters.map((k) => {
        const v = filterBy[k];
        if (typeof v === "string") {
          queryData.push(v);
          return `b.${k} = ?`;
        } else if (Number.isInteger(v)) {
          queryData.push(v.toString());
          return `b.${k} = ?`;
        }
        return "";
      });
      query += " AND " + Object.values(acceptedFilters).join(" AND ");
    }
  }

  query += ` ORDER BY b.${orderBy} ${order}`;

  if (limit) {
    query += ` LIMIT ${limit} OFFSET ${start || START_QUERY_PARAM_DEFAULT}`;
  }

  const formattedQuery = db.format(query, queryData);

  const bugs = await db.query(formattedQuery);

  if (!bugs) {
    return false;
  }

  const formattedBugs = await formatBugs(bugs, campaignId);

  return formattedBugs as StoplightComponents["schemas"]["Bug"][];
};

const formatBugs = async (bugs: any, campaignId: number) => {
  let results: any = [];
  const titleRuleIsActive = await getTitleRule(campaignId);

  for (const bug of bugs) {
    // Get bug device
    const device = getBugDevice(bug);

    const bugTitle = getBugTitle({
      bugTitle: bug.title,
      hasTitleRule: titleRuleIsActive,
    });

    results.push({
      id: bug.id,
      internal_id: bug.internal_id,
      campaign_id: bug.campaign_id,
      title: bugTitle,
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
      application_section: {
        id: bug.application_section_id,
        title: bug.application_section,
      },
      created: bug.created.toString(),
      ...(bug.updated && { updated: bug.updated.toString() }),
      note: bug.note,
      device,
      ...(bug.duplicated_of_id && { duplicated_of_id: bug.duplicated_of_id }),
      is_favorite: bug.is_favorite,
    });
  }

  return results;
};
