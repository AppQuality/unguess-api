/** OPENAPI-CLASS: get-workspace */
import { tryber } from "@src/features/database";
import WorkspaceRoute from "@src/features/routes/WorkspaceRoute";
import { getGravatar } from "@src/utils/users";

export default class Route extends WorkspaceRoute<{
  response: StoplightOperations["get-workspace"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-workspace"]["parameters"]["path"];
}> {
  private countToInt(count?: string | number) {
    if (typeof count === "undefined") return 0;
    if (typeof count === "string") return Number.parseInt(count);

    return count;
  }

  protected async hasSharedItems(): Promise<number> {
    const sharedProjects = await this.getSharedProjects();
    const sharedCampaigns = await this.getSharedCampaigns();

    return sharedProjects.length + sharedCampaigns.length;
  }

  protected async filter(): Promise<boolean> {
    const access = await this.checkWSAccess();

    if (!access) {
      const sharedItems = await this.hasSharedItems();
      if (sharedItems > 0 && this.workspace) {
        this.workspace = {
          ...this.workspace,
          isShared: true,
          sharedItems,
        };

        return true;
      }
      this.setError(403, {
        code: 403,
        message: "Workspace doesn't exist or not accessible",
      } as OpenapiError);

      return false;
    }

    return true;
  }

  protected async prepare(): Promise<void> {
    if (this.workspace) {
      // Add CSM profile picture
      let profilePic = await getGravatar(this.workspace.csm.email);
      if (profilePic) this.workspace.csm.picture = profilePic;
    }

    this.setSuccess(200, this.workspace);
  }
}
