import * as db from "@src/features/db";
import { getBugMedia } from "../getBugMedia";

export const getBugById = async (
  bugId: number
): Promise<StoplightComponents["schemas"]["Bug"] | false> => {
  const result = await db.query(
    db.format(
      `SELECT b.id,
      b.internal_id,
      b.campaign_id,
      b.message     as title,
      b.description,
      b.expected_result,
      b.current_result,
      b.status_id,
      status.name   as status_name,
      s.name        as severity,
      t.name        as type,
      r.name        as replicability,
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
      b.is_favorite
      from wp_appq_evd_bug b
        JOIN wp_appq_evd_severity s ON (b.severity_id = s.id)
        JOIN wp_appq_evd_bug_type t ON (b.bug_type_id = t.id)
        JOIN wp_appq_evd_bug_replicability r ON (b.bug_replicability_id = r.id)
        JOIN wp_appq_evd_bug_status status ON (b.status_id = status.id)
        LEFT JOIN wp_crowd_appq_device device ON (b.dev_id = device.id)
        WHERE b.campaign_id = ?;`,
      [bugId]
    )
  );

  const bug = result[0];

  // Check if bug exists
  if (!bug) {
    return false;
  }

  // Get bug additional fields (TODO)

  // Get bug media
  const media = await getBugMedia(bugId);

  return {
    id: bug.id,
    internal_id: bug.internal_id,
    campaign_id: bug.campaign_id,
    title: bug.title,
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
    created: bug.created,
    updated: bug.updated,
    note: bug.note,
    ...(media && { media }),
  };
};
