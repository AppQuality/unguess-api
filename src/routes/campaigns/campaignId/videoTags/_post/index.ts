/** OPENAPI-CLASS: post-campaigns-cid-video-tags */

import { tryber } from "@src/features/database";
import CampaignRoute from "@src/features/routes/CampaignRoute";

export default class GetVideoTags extends CampaignRoute<{
  response: StoplightOperations["post-campaigns-cid-video-tags"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["post-campaigns-cid-video-tags"]["parameters"]["path"];
  body: StoplightOperations["post-campaigns-cid-video-tags"]["requestBody"]["content"]["application/json"];
}> {
  protected async filter() {
    const body = this.getBody();
    if (!(await super.filter())) return false;
    if (this.isGroupNameInvalid(body.group.name)) {
      this.setError(400, {} as OpenapiError);
      return false;
    }
    if (body.group.id && (await this.isGroupIdInvalid(body.group.id))) {
      this.setError(400, {} as OpenapiError);
      return false;
    }
    return true;
  }

  private isGroupNameInvalid(groupName: string) {
    return groupName === "";
  }
  private async isGroupIdInvalid(groupId: number) {
    const groupIds = await tryber.tables.WpAppqUsecaseMediaTagType.do()
      .select("id")
      .where({
        campaign_id: this.getCampaignId(),
        id: groupId,
      });
    return groupId < 0 || groupIds.length === 0;
  }

  private isBodyEmpty() {
    return Object.keys(this.getBody()).length === 0;
  }

  protected async prepare(): Promise<void> {
    await this.insertNewTag();
    return this.setSuccess(200, {});
  }

  private async insertNewTag() {
    const body = this.getBody();
    let groupId = 0;

    if (!body.group.id) {
      const group = await tryber.tables.WpAppqUsecaseMediaTagType.do()
        .select("id")
        .where({
          campaign_id: this.getCampaignId(),
          name: body.group.name,
        });
      if (group.length === 0) {
        const insert =
          await tryber.tables.WpAppqUsecaseMediaTagType.do().insert({
            campaign_id: this.getCampaignId(),
            name: body.group.name,
          });
        groupId = insert[0];
      } else {
        groupId = group[0].id;
      }
    }

    await tryber.tables.WpAppqUsecaseMediaObservationsTags.do().insert({
      name: body.tag.name,
      type: body.group.id ? body.group.id : groupId,
      style: body.tag.style ? body.tag.style : "white",
    });
  }
}
