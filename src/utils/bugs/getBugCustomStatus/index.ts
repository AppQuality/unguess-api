import * as db from "@src/features/db";
import { DEFAULT_BUG_CUSTOM_STATUS } from "@src/utils/constants";

export const getBugCustomStatus = async (bug_id: number) => {
    const result = await db.query(
        db.format(
            "SELECT cs.id, cs.name FROM wp_ug_bug_custom_status cs JOIN wp_ug_bug_custom_status_to_bug csb ON (csb.custom_status_id = cs.id) WHERE csb.bug_id=?",
            [bug_id]
        ),
        "unguess"
    );
    if (!result.length) return DEFAULT_BUG_CUSTOM_STATUS;
    return result[0] as { id: number; name: string };
};