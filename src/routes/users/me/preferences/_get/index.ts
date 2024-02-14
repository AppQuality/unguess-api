/** OPENAPI-CLASS: get-users-me-preferences */

import { unguess } from "@src/features/database";
import UserRoute from "@src/features/routes/UserRoute";
import { ERROR_MESSAGE } from "@src/utils/constants";

export default class Route extends UserRoute<{
  response: StoplightOperations["get-users-me-preferences"]["responses"]["200"]["content"]["application/json"];
}> {
  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) return false;
    return true;
  }

  /* protected async prepare() {
    let preferences
    try {
    preferences = await this.getPreferences();
    } catch (e: any) {
      return this.setError(500, {
        message: e.message || ERROR_MESSAGE,
        status_code: 500,
      } as OpenapiError);
    }
    return this.setSuccess(200, preferences);
  }

  private async getPreferences() {
    const user = this.getUser();
    const preferences = unguess.tables.UserPreferences.do() 

  } */
}
