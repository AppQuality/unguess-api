import * as db from "@src/features/db";
import { DEFAULT_BUG_CUSTOM_STATUS } from "@src/utils/constants";

export const getBugCustomStatus = async (bug_id: number) => {
  const result = await db.query(
    db.format(
      `SELECT
                cs.id,
                cs.name,
                cs.color,
                cs.is_default,
                csp.id as phase_id,
                csp.name as phase_name,
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
