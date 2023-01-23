/** OPENAPI-CLASS: get-campaigns-bug-siblings */

import * as db from "@src/features/db";
import BugRoute from "@src/features/routes/BugRoute";

export default class Route extends BugRoute<{
  response: StoplightOperations["get-campaigns-bug-siblings"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-bug-siblings"]["parameters"]["path"];
}> {
  protected async prepare() {
    this.setSuccess(200, []);
  }
}
