import * as db from "@src/features/db";
import { getBugDevice } from "@src/utils/bugs/getBugDevice";
import { BugsParams } from "@src/__mocks__/database/bugs";
import { getBugTitle, getTitleRule } from "../getTitleRule";

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
      is_favorite: bug.is_favorite,
      duplicates: bug.duplicates,
    });
  }

  return results.slice(0, MAX_WIDGET_RESULTS_LENGTH);
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
  FROM wp_appq_evd_bug child
    JOIN wp_appq_evd_bug b ON (b.id = child.duplicated_of_id)
    JOIN wp_appq_evd_severity s ON (child.severity_id = s.id)
    JOIN wp_appq_evd_bug_type t ON (child.bug_type_id = t.id)
    JOIN wp_appq_evd_bug_replicability r ON (child.bug_replicability_id = r.id)
    JOIN wp_appq_evd_bug_status status ON (child.status_id = status.id)
    LEFT JOIN wp_crowd_appq_device device ON (child.dev_id = device.id)
    WHERE child.campaign_id = ? 
    and child.is_duplicated = 1
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
