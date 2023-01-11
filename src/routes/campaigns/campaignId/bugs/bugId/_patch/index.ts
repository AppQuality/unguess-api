/** OPENAPI-CLASS: patch-campaigns-cid-bugs-bid */
import { ERROR_MESSAGE } from "@src/utils/constants";
import { getCampaign } from "@src/utils/campaigns";
import UserRoute from "@src/features/routes/UserRoute";
import { getProjectById } from "@src/utils/projects";
import { getBugById } from "@src/utils/bugs";
import * as db from "@src/features/db";

export default class Route extends UserRoute<{
  parameters: StoplightOperations["patch-campaigns-cid-bugs-bid"]["parameters"]["path"];
  body: StoplightOperations["patch-campaigns-cid-bugs-bid"]["requestBody"]["content"]["application/json"];
  response: StoplightOperations["patch-campaigns-cid-bugs-bid"]["responses"]["200"]["content"]["application/json"];
}> {
  private cid: number;
  private bid: number;
  private tags: ({ tag_id: number } | { tag_name: string })[];

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    const params = this.getParameters();
    this.cid = parseInt(params.cid);
    this.bid = parseInt(params.bid);
    this.tags = this.getTags();
  }

  private getTags() {
    const tags = this.getBody().tags;
    if (!tags || tags?.length === 0) return [];
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
    await this.clearTags();
    await this.insertTags();

    const bugTags = await db.query(
      db.format(
        `
        SELECT tag_id, display_name AS tag_name
        FROM wp_appq_bug_taxonomy
                WHERE is_public = 1
            AND campaign_id = ?
            AND bug_id = ?
        `,
        [this.cid, this.bid]
      )
    );
    return this.setSuccess(200, { tags: bugTags });
  }

  private async clearTags() {
    await db.query(
      db.format(
        `DELETE FROM wp_appq_bug_taxonomy 
        WHERE campaign_id = ? AND bug_id = ?`,
        [this.cid, this.bid]
      )
    );
  }

  protected async insertTags() {
    if (!this.tags.length) return;

    const maxTagId = await this.getMaxTagId();
    const values: string[] = [];
    let i = 1;
    for (const tag of this.tags) {
      let tagToAdd;
      const existingTag = await this.getTagByNameOrId(tag);
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

  private async getTagByNameOrId(
    tag: { tag_id: number } | { tag_name: string }
  ) {
    const result: { tag_id: number; tag_name: string }[] = await db.query(
      db.format(
        `SELECT tag_id, display_name as tag_name 
    FROM wp_appq_bug_taxonomy 
    WHERE ${
      "tag_id" in tag ? `tag_id = ?` : `display_name = ?`
    }  AND campaign_id = ?`,
        ["tag_id" in tag ? tag.tag_id : tag.tag_name, this.cid]
      )
    );
    if (!result.length) return false;
    return result[0];
  }

  private async getMaxTagId() {
    const result: { id: number }[] = await db.query(
      "SELECT MAX(tag_id) AS id FROM wp_appq_bug_taxonomy"
    );

    if (!result.length) return 0;
    return result[0].id;
  }
}
