/** OPENAPI-CLASS: patch-campaigns-cid-bugs-bid */
import { ERROR_MESSAGE, NOT_FOUND, NOT_UPDATED } from "@src/utils/constants";
import { getCampaign } from "@src/utils/campaigns";
import UserRoute from "@src/features/routes/UserRoute";
import { getProjectById } from "@src/utils/projects";
import { getBugById } from "@src/utils/bugs";
import * as db from "@src/features/db";

type Field = 'tags' | 'priority_id' | 'custom_status_id';
type Priority = StoplightOperations["patch-campaigns-cid-bugs-bid"]["responses"]["200"]["content"]["application/json"]["priority"]
type Pid = number;
type CustomStatus = StoplightOperations["patch-campaigns-cid-bugs-bid"]["responses"]["200"]["content"]["application/json"]["customStatus"]
type Csid = number;

export default class Route extends UserRoute<{
  parameters: StoplightOperations["patch-campaigns-cid-bugs-bid"]["parameters"]["path"];
  body: StoplightOperations["patch-campaigns-cid-bugs-bid"]["requestBody"]["content"]["application/json"];
  response: StoplightOperations["patch-campaigns-cid-bugs-bid"]["responses"]["200"]["content"]["application/json"];
}> {
  private cid: number;
  private bid: number;
  private tags: ({ tag_id: number } | { tag_name: string })[] | undefined;
  private pid: Pid | undefined;
  private csid: Csid | undefined;
  private fields: Field[];

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);

    this.fields = Object.keys(this.getBody()) as Field[];
    this.cid = parseInt(this.getParameters().cid);
    this.bid = parseInt(this.getParameters().bid);
    this.tags = this.getTags();
    this.pid = this.getBody().priority_id;
    this.csid = this.getBody().custom_status_id;
  }

  private getTags() {
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
    if (!super.filter()) return false;
    const campaign = await getCampaign({ campaignId: this.cid });
    if (!campaign) {
      this.setError(400, {
        status_code: 400,
        message: ERROR_MESSAGE,
      } as OpenapiError);
      return false;
    }
    try {
      await getBugById({ bugId: this.bid, campaignId: this.cid });
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
        this.bugCustomStatusPatch()
      ]);

      return this.setSuccess(200, {
        tags: rTags,
        priority: rPriority,
        customStatus: rCustomStatus
      })
    }

    catch (error) {
      switch (error) {
        case NOT_FOUND: return this.setError(403, {} as OpenapiError);
        default: return this.setError(500,
          {
            message: "Something went wrong! Unable to update data"
          } as OpenapiError
        );

      }
    }
  };

  private async priorityPatch() {

    if (!this.fields.includes('priority_id')) return;
    const allPriorities = await this.getAllPriorities();
    const [result] = allPriorities.filter((priority: Priority) => priority && priority.id === this.pid);
    if (!result) return Promise.reject(NOT_FOUND);

    if (!await this.checkIfBugIdExistsInBugPriority()) { await this.addPriorityToBugPriority(result.id) }
    else { this.updatePriorityToBugPriority(result.id) }
    const [{ priority_id }] = await this.getBugPriority();

    if (priority_id !== this.pid) return Promise.reject(NOT_UPDATED);

    return Promise.resolve(result);
  };

  private async bugCustomStatusPatch() {

    if (!this.fields.includes('custom_status_id')) return;
    const allStatuses = await this.getAllStatuses();
    const [result] = allStatuses.filter((customStatus: CustomStatus) => customStatus && customStatus.id === this.csid);
    if (!result) return Promise.reject(NOT_FOUND);

    if (!await this.checkIfBugIdExistsInBugStatus()) { await this.addStatusToBugStatus(result.id) }
    else { this.updateStatusToBugStatus(result.id) }
    const [{ custom_status_id }] = await this.getBugStatus();
    if (custom_status_id !== this.csid) return Promise.reject(NOT_UPDATED);

    return Promise.resolve(result);
  };

  private async tagsPatch() {
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
          db.format(`(?,?,?,?,?,?,?,1)`, [
            tagToAdd.id,
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
      (tag_id, display_name, slug, bug_id, campaign_id, author_wp_id, author_tid, is_public) 
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
        `, [this.bid]
      ), "unguess"
    );
    if (result) return true;
    return false;
  };

  private async getBugPriority(): Promise<{ priority_id: number }[]> {
    return await db.query(db.format(
      `
      SELECT priority_id
      FROM wp_ug_priority_to_bug
      WHERE bug_id = ? 
      `, [this.bid]
    ), "unguess");
  };

  private async addPriorityToBugPriority(pid: Pid): Promise<void> {
    await db.query(db.format(
      `
        INSERT INTO wp_ug_priority_to_bug (bug_id, priority_id)
        VALUES (?, ?)
      `, [this.bid, pid]
    ), "unguess");
  };

  private async updatePriorityToBugPriority(pid: Pid): Promise<void> {
    await db.query(db.format(`
      UPDATE wp_ug_priority_to_bug
      SET priority_id = ?
      WHERE bug_id = ?
    `, [pid, this.bid]
    ), "unguess");
  };

  private async getAllStatuses(): Promise<CustomStatus[]> {
    return await db.query(
      "SELECT id, name FROM unguess_bug_custom_status ORDER BY id",
      "unguess"
    );
  }

  private async checkIfBugIdExistsInBugStatus(): Promise<Boolean> {
    const [result] = await db.query(
      db.format(
        `SELECT bug_id 
        FROM wp_ug_bug_custom_status_to_bug
        WHERE bug_id = ?
        `, [this.bid]
      ), "unguess"
    );
    if (result) return true;
    return false;
  };

  private async addStatusToBugStatus(csid: Csid): Promise<void> {
    await db.query(db.format(
      `
        INSERT INTO wp_ug_bug_custom_status_to_bug (bug_id, custom_status_id)
        VALUES (?, ?)
      `, [this.bid, csid]
    ), "unguess");
  };

  private async updateStatusToBugStatus(csid: Csid): Promise<void> {
    await db.query(db.format(`
      UPDATE wp_ug_bug_custom_status_to_bug
      SET custom_status_id = ?
      WHERE bug_id = ?
    `, [csid, this.bid]
    ), "unguess");
  };

  private async getBugStatus(): Promise<{ custom_status_id: number }[]> {
    return await db.query(db.format(
      `
      SELECT custom_status_id
      FROM wp_ug_bug_custom_status_to_bug
      WHERE bug_id = ? 
      `, [this.bid]
    ), "unguess");
  };
};