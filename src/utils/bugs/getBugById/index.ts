import * as db from "@src/features/db";
import { getBugTitle, getTitleRule } from "@src/utils/campaigns";
import { ERROR_MESSAGE } from "@src/utils/constants";
import { getBugAdditional } from "../getBugAdditional";
import { getBugDevice } from "../getBugDevice";
import { getBugMedia } from "../getBugMedia";
import { getBugTags } from "../getBugTags";

type BugWithMedia =
  StoplightOperations["get-campaigns-single-bug"]["responses"]["200"]["content"]["application/json"];

export const getBugById = async ({
  bugId,
  showNeedReview,
}: {
  bugId: number;
  showNeedReview?: boolean;
}): Promise<BugWithMedia> => {
  const error = {
    code: 400,
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];

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
      b.application_section_id,
      b.application_section,
      uc.title as uc_title,
      uc.simple_title as uc_simple_title,
      uc.prefix as uc_prefix,
      b.is_duplicated,
      b.duplicated_of_id,
      b.is_favorite,
      b.bug_replicability_id,
      b.bug_type_id,
      b.severity_id
      from wp_appq_evd_bug b
        JOIN wp_appq_evd_severity s ON (b.severity_id = s.id)
        JOIN wp_appq_evd_bug_type t ON (b.bug_type_id = t.id)
        JOIN wp_appq_evd_bug_replicability r ON (b.bug_replicability_id = r.id)
        JOIN wp_appq_evd_bug_status status ON (b.status_id = status.id)
        LEFT JOIN wp_crowd_appq_device device ON (b.dev_id = device.id)
        LEFT JOIN wp_appq_campaign_task uc ON (uc.id = b.application_section_id)
        WHERE b.id = ? 
        AND b.publish = 1
        AND ${
          showNeedReview
            ? `(status.name = 'Approved' OR status.name = 'Need Review')`
            : `status.name = 'Approved'`
        };`,
      [bugId]
    )
  );

  const bug = result[0];

  // Check if bug exists
  if (!bug) {
    throw {
      ...error,
      message: "GET_BUG_ERROR: this bug doesn't exists or you cannot see it.",
    };
  }

  // Get bug device
  const device = getBugDevice(bug);

  // Get bug media
  const media = await getBugMedia(bugId);

  // Get tags
  const tags = await getBugTags(bugId);

  // Get bug additional fields
  const additional = await getBugAdditional(bugId);

  // Check bug title
  const hasTitleRule = await getTitleRule(bug.campaign_id);
  const bugTitle = getBugTitle({
    bugTitle: bug.title,
    hasTitleRule,
  });

  return {
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
    updated: bug.updated.toString(),
    note: bug.note,
    device,
    media: media || [],
    tags: tags || [],
    additional_fields: additional || [],
  };
};
