import * as db from "@src/features/db";
import { DEFAULT_BUG_PRIORITY } from "@src/utils/constants";

export const getBugPriority = async (bug_id: number) => {
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