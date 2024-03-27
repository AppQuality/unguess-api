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
    if (
      this.isGroupNameInvalid(body.group.name) ||
      this.isTagNameInvalid(body.tag.name)
    ) {
      this.setError(400, {} as OpenapiError);
      return false;
    }
    return true;
  }

  private isGroupNameInvalid(groupName: string) {
    return groupName === "";
  }
  private isTagNameInvalid(tagName: string) {
    return tagName === "";
  }

  protected async prepare(): Promise<void> {
    await this.insertNewTag();
    return this.setSuccess(200, {});
  }

  private async insertNewTag() {
    const body = this.getBody();
    let groupId = 0;
    const campaignTagGroups = await this.getCampaignTagGroups();

    if (this.groupNotExist(campaignTagGroups)) {
      groupId = (await this.insertTagGroup(body.group.name))[0].id;
    } else {
      const existingGroupId = campaignTagGroups.find(
        (group) => group.name === body.group.name
      )?.id;
      groupId = existingGroupId ? existingGroupId : 0;
    }

    await tryber.tables.WpAppqUsecaseMediaObservationsTags.do().insert({
      name: body.tag.name,
      type: groupId,
      style: body.tag.style ? body.tag.style : "white",
    });
  }

  private groupNotExist(tagGroups: { id: number; name: string }[]) {
    const body = this.getBody();
    return (
      tagGroups.find((group) => group.name === body.group.name) === undefined
    );
  }
  private async getCampaignTagGroups() {
    const body = this.getBody();
    return await tryber.tables.WpAppqUsecaseMediaTagType.do()
      .select("id", "name")
      .where({
        campaign_id: this.getCampaignId(),
        name: body.group.name,
      });
  }
  private async insertTagGroup(groupName: string) {
    return await tryber.tables.WpAppqUsecaseMediaTagType.do()
      .insert({
        campaign_id: this.getCampaignId(),
        name: groupName,
      })
      .returning("id");
  }
}
