/** OPENAPI-CLASS: patch-campaigns-cid-bugs-bid */
import { ERROR_MESSAGE } from "@src/utils/constants";
import { getCampaign } from "@src/utils/campaigns";
import BugsRoute from "@src/features/routes/BugRoute";
import { getProjectById } from "@src/utils/projects";
import { getBugById } from "@src/utils/bugs";
import * as db from "@src/features/db";

type AcceptedField = "tags" | "priority_id" | "custom_status_id";
type Priority =
  StoplightOperations["patch-campaigns-cid-bugs-bid"]["responses"]["200"]["content"]["application/json"]["priority"];
type CustomStatus =
  StoplightOperations["patch-campaigns-cid-bugs-bid"]["responses"]["200"]["content"]["application/json"]["custom_status"];

export default class Route extends BugsRoute<{
  parameters: StoplightOperations["patch-campaigns-cid-bugs-bid"]["parameters"]["path"];
  body: StoplightOperations["patch-campaigns-cid-bugs-bid"]["requestBody"]["content"]["application/json"];
  response: StoplightOperations["patch-campaigns-cid-bugs-bid"]["responses"]["200"]["content"]["application/json"];
}> {
  private cid: number;
  private bid: number;
  private tags: ({ tag_id: number } | { tag_name: string })[] | undefined;
  private priorityId: number | undefined;
  private customStatusId: number | undefined;
  private fields: AcceptedField[] = [];

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    const params = this.getParameters();

    this.fields = Object.keys(this.getBody()) as AcceptedField[];
    this.cid = parseInt(params.cid);
    this.bid = parseInt(params.bid);
    this.tags = this.getBugTags();
    this.priorityId = this.getBody().priority_id;
    this.customStatusId = this.getBody().custom_status_id;
  }

  private getBugTags() {
    const tags = this.getBody().tags;

    if (!tags) return undefined;
    if (tags?.length === 0) return [];

    const tagsId = tags.map((tag) => {
      if ("tag_id" in tag) return tag.tag_id;
      return tag.tag_name;
    });
    const uniqueTagsId = [...new Set(tagsId)];
    return uniqueTagsId.map((tagIdOrName) => {
      if (typeof tagIdOrName === "number") return { tag_id: tagIdOrName };
      return { tag_name: tagIdOrName };
    });
  }

  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) {
      this.setError(403, { message: "Something went wrong!" } as OpenapiError);
      return false;
    }

    const campaign = await getCampaign({ campaignId: this.cid });
    if (!campaign) {
      this.setError(400, {
        status_code: 400,
        message: ERROR_MESSAGE,
      } as OpenapiError);
      return false;
    }
    try {
      await getBugById({
        bugId: this.bid,
        campaignId: this.cid,
        showNeedReview: campaign.showNeedReview,
      });
    } catch (e) {
      this.setError(400, {
        status_code: 400,
        message: ERROR_MESSAGE,
      } as OpenapiError);
      return false;
    }

    try {
      // Check if user has permission to edit the campaign
      await getProjectById({
        projectId: campaign.project.id,
        user: this.getUser(),
      });
    } catch (e) {
      this.setError(403, {
        message: ERROR_MESSAGE,
      } as OpenapiError);
      return false;
    }
    return true;
  }

  protected async prepare(): Promise<void> {
    try {
      const [rTags, rPriority, rCustomStatus] = await Promise.all([
        this.tagsPatch(),
        this.priorityPatch(),
        this.bugCustomStatusPatch(),
      ]);

      return this.setSuccess(200, {
        tags: rTags,
        priority: rPriority,
        custom_status: rCustomStatus,
      });
    } catch (error) {
      switch (error) {
        case "NOT_FOUND":
          return this.setError(403, {} as OpenapiError);
        default:
          return this.setError(500, {
            message: "Something went wrong! Unable to update data",
          } as OpenapiError);
      }
    }
  }

  private async bugCustomStatusPatch() {
    if (!this.fields.includes("custom_status_id")) return;
    const allStatuses = await this.getAllStatuses();
    const [result] = allStatuses.filter(
      (customStatus: CustomStatus) =>
        customStatus && customStatus.id === this.customStatusId
    );
    if (!result) return Promise.reject("NOT_FOUND");

    if (!(await this.checkIfBugIdExistsInBugStatus())) {
      await this.addStatusToBugStatus(result.id);
    } else {
      this.updateStatusToBugStatus(result.id);
    }
    const [{ custom_status_id }] = await this.getBugStatus();
    if (custom_status_id !== this.customStatusId)
      return Promise.reject("NOT_UPDATED");

    return Promise.resolve(result);
  }

  private async priorityPatch() {
    if (!this.fields.includes("priority_id")) return;
    const allPriorities = await this.getAllPriorities();
    const [result] = allPriorities.filter(
      (priority: Priority) => priority && priority.id === this.priorityId
    );
    if (!result) return Promise.reject("NOT_FOUND");

    if (!(await this.checkIfBugIdExistsInBugPriority())) {
      await this.addPriorityToBugPriority(result.id);
    } else {
      this.updatePriorityToBugPriority(result.id);
    }
    const [{ priority_id }] = await this.getBugPriority();

    if (priority_id !== this.priorityId) return Promise.reject("NOT_UPDATED");

    return Promise.resolve(result);
  }

  private async tagsPatch() {
    if (!this.fields.includes("tags")) return;
    if (this.tags) await this.replaceTags();
    return await this.getCurrentTags();
  }

  private async getCurrentTags(
    { byBug }: { byBug: boolean } = { byBug: true }
  ): Promise<{ tag_id: number; tag_name: string }[]> {
    return await db.query(
      db.format(
        `
        SELECT tag_id, display_name AS tag_name
        FROM wp_appq_bug_taxonomy
                WHERE is_public = 1
            AND campaign_id = ?
            ${byBug ? "AND bug_id = ?" : ""}
        `,
        [this.cid, ...(byBug ? [this.bid] : [])]
      )
    );
  }

  private async clearTags() {
    await db.query(
      db.format(
        `DELETE FROM wp_appq_bug_taxonomy 
        WHERE is_public = 1 AND campaign_id = ? AND bug_id = ?`,
        [this.cid, this.bid]
      )
    );
  }

  protected async replaceTags() {
    const tags = await this.getCurrentTags({ byBug: false });
    const maxTagId = await this.getMaxTagId();
    await this.clearTags();
    if (!this.tags || !this.tags.length) return;

    const values: string[] = [];
    let i = 1;
    for (const tag of this.tags) {
      let tagToAdd;
      const existingTag = tags.find(
        (t) => "tag_id" in tag && t.tag_id === tag.tag_id
      );
      if ("tag_name" in tag && !existingTag) {
        tagToAdd = {
          id: maxTagId + i++,
          name: tag.tag_name,
        };
      } else if (existingTag) {
        tagToAdd = {
          id: existingTag.tag_id,
          name: existingTag.tag_name,
        };
      }
      if (tagToAdd) {
        values.push(
          db.format(`(?,?,?,?,?,?,?,?,1)`, [
            tagToAdd.id,
            tagToAdd.name,
            tagToAdd.name,
            tagToAdd.name,
            this.bid,
            this.cid,
            this.getWordpressId("unguess"),
            this.getUserId(),
          ])
        );
      }
    }
    if (!values.length) return;

    await db.query(`
    INSERT INTO wp_appq_bug_taxonomy 
      (tag_id, display_name, slug, description, bug_id, campaign_id, author_wp_id, author_tid, is_public) 
    VALUES ${values.join(",")}
  `);
  }

  private async getMaxTagId() {
    const result: { id: number }[] = await db.query(
      "SELECT MAX(tag_id) AS id FROM wp_appq_bug_taxonomy"
    );

    if (!result.length) return 0;
    return result[0].id;
  }

  private async getAllPriorities(): Promise<Priority[]> {
    return await db.query(
      "SELECT id, name FROM wp_ug_priority ORDER BY id",
      "unguess"
    );
  }

  private async checkIfBugIdExistsInBugPriority(): Promise<Boolean> {
    const [result] = await db.query(
      db.format(
        `SELECT bug_id 
        FROM wp_ug_priority_to_bug
        WHERE bug_id = ?
        `,
        [this.bid]
      ),
      "unguess"
    );
    if (result) return true;
    return false;
  }

  private async getBugPriority(): Promise<{ priority_id: number }[]> {
    return await db.query(
      db.format(
        `
        SELECT priority_id
        FROM wp_ug_priority_to_bug
        WHERE bug_id = ? 
      `,
        [this.bid]
      ),
      "unguess"
    );
  }

  private async addPriorityToBugPriority(priorityId: number): Promise<void> {
    await db.query(
      db.format(
        `
        INSERT INTO wp_ug_priority_to_bug (bug_id, priority_id)
        VALUES (?, ?)
      `,
        [this.bid, priorityId]
      ),
      "unguess"
    );
  }

  private async updatePriorityToBugPriority(priorityId: number): Promise<void> {
    await db.query(
      db.format(
        `
      UPDATE wp_ug_priority_to_bug
      SET priority_id = ?
      WHERE bug_id = ?
    `,
        [priorityId, this.bid]
      ),
      "unguess"
    );
  }

  private async getAllStatuses(): Promise<CustomStatus[]> {
    const results: {
      id: number;
      name: string;
      color: string;
      is_default: number;
      phase_id: number;
      phase_name: string;
    }[] = await db.query(
      db.format(
        `SELECT 
        cs.id, 
        cs.name,  
        cs.color, 
        cs.is_default,
        csp.id as phase_id,
        csp.name as phase_name 
    FROM wp_ug_bug_custom_status cs
    JOIN wp_ug_bug_custom_status_phase csp ON cs.phase_id = csp.id 
    WHERE(cs.campaign_id = ? AND cs.is_default = 0) 
    OR (cs.campaign_id IS NULL AND cs.is_default = 1)
    ORDER BY cs.phase_id ASC, cs.id;
    `,
        [this.cid]
      ),
      "unguess"
    );

    return results.map((customStatus) => ({
      id: customStatus.id,
      name: customStatus.name,
      color: customStatus.color,
      is_default: customStatus.is_default,
      phase: {
        id: customStatus.phase_id,
        name: customStatus.phase_name,
      },
    }));
  }

  private async checkIfBugIdExistsInBugStatus(): Promise<Boolean> {
    const [result] = await db.query(
      db.format(
        `SELECT bug_id 
        FROM wp_ug_bug_custom_status_to_bug
        WHERE bug_id = ?
        `,
        [this.bid]
      ),
      "unguess"
    );
    if (result) return true;
    return false;
  }

  private async addStatusToBugStatus(csid: number): Promise<void> {
    await db.query(
      db.format(
        `
        INSERT INTO wp_ug_bug_custom_status_to_bug (bug_id, custom_status_id)
        VALUES (?, ?)
      `,
        [this.bid, csid]
      ),
      "unguess"
    );
  }

  private async updateStatusToBugStatus(csid: number): Promise<void> {
    await db.query(
      db.format(
        `
      UPDATE wp_ug_bug_custom_status_to_bug
      SET custom_status_id = ?
      WHERE bug_id = ?
    `,
        [csid, this.bid]
      ),
      "unguess"
    );
  }

  private async getBugStatus(): Promise<{ custom_status_id: number }[]> {
    return await db.query(
      db.format(
        `
      SELECT custom_status_id
      FROM wp_ug_bug_custom_status_to_bug
      WHERE bug_id = ? 
      `,
        [this.bid]
      ),
      "unguess"
    );
  }
}
