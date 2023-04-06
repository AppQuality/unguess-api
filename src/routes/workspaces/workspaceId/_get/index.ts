/** OPENAPI-CLASS: get-workspace */
import WorkspaceRoute from "@src/features/routes/WorkspaceRoute";

export default class Route extends WorkspaceRoute<{
  response: StoplightOperations["get-workspace"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-workspace"]["parameters"]["path"];
}> {
  protected async prepare(): Promise<void> {
    this.setSuccess(200, this.workspace);
  }
}
