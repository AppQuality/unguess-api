/** OPENAPI-CLASS: get-campaigns-single-bug */
import * as db from "@src/features/db";
import { getBugById } from "@src/utils/bugs";
import BugsRoute from "@src/features/routes/BugRoute";
import {
  DEFAULT_BUG_PRIORITY,
  DEFAULT_BUG_CUSTOM_STATUS,
} from "@src/utils/constants";

type Bug =
  StoplightOperations["get-campaigns-single-bug"]["responses"]["200"]["content"]["application/json"];

export default class Route extends BugsRoute<{
  response: StoplightOperations["get-campaigns-single-bug"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-single-bug"]["parameters"]["path"];
}> {
  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) return false;

    if (!this.shouldShowThisBug()) {
      this.setError(400, {
        status_code: 400,
        name: "bugs",
        message: "You don't have access to this bug",
      });
      return false;
    }
    return true;
  }

  protected async prepare(): Promise<void> {
    const bug = await getBugById({
      bugId: this.bug_id,
      campaignId: this.cp_id,
      showNeedReview: this.shouldShowNeedReview(),
    });
    await this.setBugAsRead();

    const enhancedBug = await this.enhanceBug(bug);
    this.setSuccess(200, enhancedBug);
  }

  private async setBugAsRead() {
    const readStatus = await this.getReadStatus();

    if (readStatus) return;

    if (typeof readStatus === "undefined") {
      await db.query(
        db.format(
          "INSERT INTO wp_appq_bug_read_status (wp_id,bug_id,is_read, profile_id) VALUES (?,?,1,?) ",
          [this.getWordpressId("tryber"), this.bug_id, this.getProfileId()]
        )
      );
      return;
    }

    await db.query(
      db.format(
        "UPDATE wp_appq_bug_read_status SET is_read = 1 WHERE wp_id=? AND bug_id=? ",
        [this.getWordpressId("tryber"), this.bug_id]
      )
    );
  }

  private async getReadStatus() {
    const result = await db.query(
      db.format(
        "SELECT is_read FROM wp_appq_bug_read_status WHERE wp_id=? AND bug_id=?",
        [this.getWordpressId("tryber"), this.bug_id]
      )
    );
    if (!result.length) return undefined;
    return result[0].is_read === 1;
  }

  private async getPriority() {
    const result = await db.query(
      db.format(
        "SELECT p.id, p.name FROM wp_ug_priority p JOIN wp_ug_priority_to_bug pb ON (pb.priority_id = p.id) WHERE pb.bug_id=?",
        [this.bug_id]
      ),
      "unguess"
    );
    if (!result.length) return DEFAULT_BUG_PRIORITY;
    return result[0] as { id: number; name: string };
  }

  private async getCustomStatus(): Promise<
    StoplightComponents["schemas"]["BugCustomStatus"]
  > {
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
        JOIN wp_ug_bug_custom_status_to_bug csb ON (csb.custom_status_id = cs.id) 
        JOIN wp_ug_bug_custom_status_phase csp ON (cs.phase_id = csp.id)
        WHERE csb.bug_id=?`,
        [this.bug_id]
      ),
      "unguess"
    );

    if (!result.length) return DEFAULT_BUG_CUSTOM_STATUS;
    return {
      id: result[0].id,
      name: result[0].name,
      phase: {
        id: result[0].phase_id,
        name: result[0].phase_name,
      },
      color: result[0].color,
      is_default: result[0].is_default,
    };
  }

  private async enhanceBug(bug: Bug) {
    const priority = await this.getPriority();
    const customStatus = await this.getCustomStatus();

    return {
      ...bug,
      priority,
      custom_status: customStatus,
    };
  }
}
