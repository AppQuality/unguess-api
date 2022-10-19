import * as db from "@src/features/db";

export type BugsOrderBy =
  | "id"
  | "status_id"
  | "severity_id"
  | "created"
  | "updated"
  | "last_seen"
  | "is_duplicated"
  | "is_favorite";
export type BugsOrder = "ASC" | "DESC";

export const getCampaignBugs = async ({
  campaignId,
}: {
  campaignId: number;
}): Promise<StoplightComponents["schemas"]["Bug"][] | false> => {
  const result = await db.query(
    db.format(
      `SELECT b.*
          FROM wp_appq_evd_bug b 
          WHERE b.campaign_id = ?
          GROUP BY b.id`,
      [campaignId]
    )
  );

  const bugs = result;

  if (!bugs) {
    return false;
  }

  return (await formattedBugs(bugs)) as StoplightComponents["schemas"]["Bug"][];
};

const formattedBugs = async (bugs: any) => {
  let results: any = [];
  for (const bug of bugs) {
    results.push({
      id: bug.id,
      internal_id: bug.internal_id,
      campaign_id: bug.campaign_id,
      title: bug.message,
      step_by_step: bug.description,
      expected_result: bug.expected_result,
      current_result: bug.current_result,
      status: {
        id: bug.status_id,
        name: bug.status_reason,
      },
      severity: {
        id: bug.severity_id,
        name: "severity", // TODO: get severity name
      },
      type: {
        id: bug.bug_type_id,
        name: "bug type", // TODO: get bug type name
      },
      replicability: {
        id: bug.bug_replicability_id,
        name: "replicability", // TODO: get replicability name
      },
      created: bug.created,
      updated: bug.updated,
      note: bug.note,
      device: {
        manufacturer: bug.manufacturer,
        model: bug.model,
        os: bug.os,
        os_version: bug.os_version,
        type: "device type", // TODO: get device type name
      },
      application_section: {
        id: bug.application_section_id,
        title: bug.application_section,
      },
      ...(bug.duplicated_of_id && { duplicated_of_id: bug.duplicated_of_id }),
      is_favorite: bug.is_favorite,
    });
  }

  return results;
};
