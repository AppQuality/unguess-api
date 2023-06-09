/** OPENAPI-CLASS: get-projects-projectId */
import ProjectRoute from "@src/features/routes/ProjectRoute";

export default class Route extends ProjectRoute<{
  response: StoplightOperations["get-projects-projectId"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-projects-projectId"]["parameters"]["path"];
}> {
  protected async prepare(): Promise<void> {
    this.setSuccess(200, this.project);
  }
}
