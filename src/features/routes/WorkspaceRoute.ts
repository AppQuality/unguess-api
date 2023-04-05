import UserRoute from "./UserRoute";
import { getWorkspace } from "@src/utils/workspaces";

export default class WorkspaceRoute<
  T extends RouteClassTypes & {
    parameters: T["parameters"] & { wid: string | number };
  }
> extends UserRoute<T> {
  protected workspace_id: number;
  protected workspace: StoplightComponents["schemas"]["Workspace"] | undefined;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);

    const params = this.getParameters();

    if (!params.wid) throw new Error("Missing workspace id");

    this.workspace_id = Number.isInteger(params.wid)
      ? params.wid
      : Number.parseInt(params.wid);
  }

  protected async init(): Promise<void> {
    await super.init();

    if (isNaN(this.workspace_id)) {
      this.setError(400, {
        code: 400,
        message: "Invalid workspace id",
      } as OpenapiError);

      throw new Error("Invalid workspace id");
    }

    await this.initWorkspace();

    if (!this.workspace) {
      this.setError(403, {
        code: 403,
        message: "Workspace not found",
      } as OpenapiError);

      throw new Error("Workspace not found");
    }
  }

  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) return false;
    return true;
  }

  private async initWorkspace() {
    try {
      this.workspace = await getWorkspace({
        workspaceId: this.getWorkspaceId(),
        user: this.getUser(),
      });
    } catch (error) {
      return false;
    }
    return true;
  }

  protected getWorkspaceId() {
    if (typeof this.workspace_id === "undefined")
      throw new Error("Invalid workspace");
    return this.workspace_id;
  }

  protected getWorkspace() {
    if (!this.workspace) throw new Error("Invalid workspace");
    return this.workspace;
  }
}
