/** OPENAPI-CLASS: get-workspace */
import { getWorkspace } from "@src/utils/workspaces";
import { ERROR_MESSAGE } from "@src/utils/constants";
import UserRoute from "@src/features/routes/UserRoute";
import WorkspaceRoute from "@src/features/routes/WorkspaceRoute";

export default class Route extends WorkspaceRoute<{
  response: StoplightOperations["get-workspace"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-workspace"]["parameters"]["path"];
}> {
  protected async prepare(): Promise<void> {
    this.setSuccess(200, this.workspace);
  }
}
