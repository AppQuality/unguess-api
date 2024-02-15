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

  protected async prepare() {
    let preferences;
    try {
      preferences = await this.getPreferences();
    } catch (e: any) {
      return this.setError(500, {
        message: e.message || ERROR_MESSAGE,
        status_code: 500,
      } as OpenapiError);
    }
    if (!preferences.items || !preferences.items.length)
      return this.emptyResponse();
    return this.setSuccess(200, preferences);
  }

  private async getPreferences() {
    const profileId = this.getProfileId();
    const results = await unguess.tables.Preferences.do()
      .select(
        "preferences.id as preference_id",
        "preferences.name",
        unguess.raw(
          "COALESCE(user_preferences.value, preferences.default_value) as value"
        )
      )
      .leftJoin("user_preferences", function () {
        this.on("preferences.id", "=", "user_preferences.preference_id").andOn(
          "user_preferences.profile_id",
          "=",
          unguess.raw("?", [profileId])
        );
      })
      .where("preferences.is_active", 1);
    return { items: results };
  }

  private emptyResponse() {
    return this.setSuccess(200, {
      items: [],
    });
  }
}
