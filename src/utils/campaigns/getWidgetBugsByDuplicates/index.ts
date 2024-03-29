import * as db from "@src/features/db";
import { getBugDevice } from "@src/utils/bugs/getBugDevice";
import { BugsParams } from "@src/__mocks__/database/bugs";
import { getBugTitle, getTitleRule } from "../getTitleRule";
import {
  DEFAULT_BUG_CUSTOM_STATUS,
  DEFAULT_BUG_PRIORITY,
} from "@src/utils/constants";

interface Bug extends BugsParams {
  last_seen: string;
  duplicates: number;
}

const MAX_WIDGET_RESULTS_LENGTH = 10;

type BugItem = StoplightComponents["schemas"]["Bug"] & {
  duplicates: number;
};

const formatBugs = async (bugs: any, campaignId: number) => {
  let results: BugItem[] = [];
  const titleRuleIsActive = await getTitleRule(campaignId);

  // Sort by duplicates and last seen
  bugs.sort((a: Bug, b: Bug) => {
    if (a.duplicates === b.duplicates) {
      return new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime();
    } else {
      return b.duplicates - a.duplicates;
    }
  });

  for (const bug of bugs) {
    // Get bug device
    const device = getBugDevice(bug);

    const bugTitle = getBugTitle({
      bugTitle: bug.title,
      hasTitleRule: titleRuleIsActive,
    });

    const bugPriority = await getPriority(bug.id);

    const bugCustomStatus = await getCustomStatus(bug.id);

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
        title: bug.uc_title ?? bug.application_section,
        ...(bug.uc_simple_title && { simple_title: bug.uc_simple_title }),
        ...(bug.uc_prefix && { prefix: bug.uc_prefix }),
      },
      created: bug.created.toString(),
      occurred_date: bug.occurred_date.toString(),
      ...(bug.updated && { updated: bug.updated.toString() }),
      note: bug.note,
      device,
      is_favorite: bug.is_favorite,
      duplicates: bug.duplicates,
      priority: bugPriority,
      custom_status: bugCustomStatus,
    });
  }

  return results.slice(0, MAX_WIDGET_RESULTS_LENGTH);
};

const getPriority = async (bug_id: number) => {
  const result = await db.query(
    db.format(
      "SELECT p.id, p.name FROM wp_ug_priority p JOIN wp_ug_priority_to_bug pb ON (pb.priority_id = p.id) WHERE pb.bug_id=?",
      [bug_id]
    ),
    "unguess"
  );
  if (!result.length) return DEFAULT_BUG_PRIORITY;
  return result[0] as { id: number; name: string };
};

const getCustomStatus = async (bug_id: number) => {
  const result = await db.query(
    db.format(
      `SELECT
          cs.id,
          cs.name,
          cs.color,
          cs.is_default,
          csp.id as phase_id,
          csp.name as phase_name
      FROM wp_ug_bug_custom_status cs 
      JOIN wp_ug_bug_custom_status_phase csp ON (cs.phase_id = csp.id)
      JOIN wp_ug_bug_custom_status_to_bug csb ON (csb.custom_status_id = cs.id) 
      WHERE csb.bug_id=?`,
      [bug_id]
    ),
    "unguess"
  );
  if (!result.length) return DEFAULT_BUG_CUSTOM_STATUS;
  return {
    id: result[0].id,
    name: result[0].name,
    color: result[0].color,
    is_default: result[0].is_default,
    phase: {
      id: result[0].phase_id,
      name: result[0].phase_name,
    },
  };
};

export const getWidgetBugsByDuplicates = async (
  campaign: StoplightComponents["schemas"]["CampaignWithOutput"] & {
    showNeedReview: boolean;
  }
): Promise<StoplightComponents["schemas"]["WidgetBugsByDuplicates"]> => {
  const error = {
    code: 400,
    message: "Something went wrong with bugs-by-duplicates widget",
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  // Widget requires bugs output
  if (!campaign.outputs || !campaign.outputs.includes("bugs")) {
    throw error;
  }

  const query = `SELECT 
    b.id,
    count(child.duplicated_of_id) as duplicates,
    b.last_seen,
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
    b.last_seen as occurred_date,
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
    b.severity_id
  FROM wp_appq_evd_bug child
    JOIN wp_appq_evd_bug b ON (b.id = child.duplicated_of_id)
    JOIN wp_appq_evd_severity s ON (child.severity_id = s.id)
    JOIN wp_appq_evd_bug_type t ON (child.bug_type_id = t.id)
    JOIN wp_appq_evd_bug_replicability r ON (child.bug_replicability_id = r.id)
    JOIN wp_appq_evd_bug_status status ON (child.status_id = status.id)
    LEFT JOIN wp_crowd_appq_device device ON (child.dev_id = device.id)
    LEFT JOIN wp_appq_campaign_task uc ON (uc.id = b.application_section_id)
    WHERE child.campaign_id = ? 
    AND child.publish = 1
    AND child.is_duplicated = 1
    AND ${
      campaign.showNeedReview
        ? `(status.name = 'Approved' OR status.name = 'Need Review')`
        : `status.name = 'Approved'`
    }
    group by child.duplicated_of_id
    ORDER BY duplicates DESC;
`;

  const result = await db.query(db.format(query, [campaign.id]));

  if (!result) {
    throw {
      ...error,
      message: "No bugs found for this campaign",
    };
  }

  const formattedBugs = await formatBugs(result, campaign.id);

  return {
    data: formattedBugs,
    kind: "bugsByDuplicates",
  } as StoplightComponents["schemas"]["WidgetBugsByDuplicates"];
};
