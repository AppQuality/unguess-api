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
  private tags: ({ tag_id: number } | { tag_name: string })[] | undefined;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    const params = this.getParameters();
    this.cid = parseInt(params.cid);
    this.bid = parseInt(params.bid);
    this.tags = this.getBody().tags;
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
      await getBugById({ bugId: this.bid });
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
    await db.query(
      db.format(
        `
        DELETE FROM wp_appq_bug_taxonomy 
        WHERE campaign_id = ?
            AND bug_id = ?
        `,
        [this.cid, this.bid]
      )
    );

    //insert incoming tags
    if (this.tags?.length) {
      const insertIncomingTags = await this.getQueryInsertIncomingTags(
        this.tags
      );
      await db.query(insertIncomingTags);
    }

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

  protected async getQueryInsertIncomingTags(
    tags: { tag_id?: number; tag_name?: string }[]
  ): Promise<string> {
    let query = `
      INSERT INTO wp_appq_bug_taxonomy 
        (tag_id, display_name, slug, bug_id, campaign_id, author_wp_id, author_tid, is_public) 
      VALUES
    `;
    const values = await Promise.all(
      tags.map(async (tag, i) => {
        const exitingTag = await db.query(
          `SELECT tag_id, display_name as tag_name 
          FROM wp_appq_bug_taxonomy 
          WHERE ${
            tag.tag_id
              ? `tag_id = ${tag.tag_id}`
              : `display_name = '${tag.tag_name}'`
          } `
        );

        if (exitingTag.length > 0) {
          return `
          (${exitingTag[0].tag_id}, '${exitingTag[0].tag_name}', '${
            exitingTag[0].tag_name
          }', ${this.bid}, ${this.cid}, ${this.getUser().unguess_wp_user_id}, ${
            this.getUser().tryber_wp_user_id
          }, 1)`;
        }

        const maxTagId = await db.query(
          "SELECT MAX(tag_id) AS id FROM wp_appq_bug_taxonomy"
        );
        return `
            (${maxTagId[0].id + i}, '${tag.tag_name}', '${tag.tag_name}', ${
          this.bid
        }, ${this.cid}, ${this.getUser().unguess_wp_user_id}, ${
          this.getUser().tryber_wp_user_id
        }, 1)`;
      })
    );
    return query + values.join(",");
  }
}
