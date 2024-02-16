/** OPENAPI-CLASS: put-users-me-preferences-prefid */

import { unguess } from "@src/features/database";
import UserPreferencesRoute from "@src/features/routes/UserPreferencesRoute";
import { ERROR_MESSAGE } from "@src/utils/constants";

export default class Route extends UserPreferencesRoute<{
  response: StoplightOperations["put-users-me-preferences-prefid"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["put-users-me-preferences-prefid"]["parameters"]["path"];
}> {
  private value: StoplightOperations["put-users-me-preferences-prefid"]["requestBody"]["content"]["application/json"]["value"];

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    this.value = this.getBody().value || null;
  }

  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) return false;
    return true;
  }

  protected async prepare() {
    try {
      const preference = await this.updateOrAssignPreference();
      return this.setSuccess(200, preference);
    } catch (e: any) {
      return this.setError(500, {
        message: e.message || ERROR_MESSAGE,
        status_code: 500,
      } as OpenapiError);
    }
  }

  private async getUserPreference(id: number) {
    const profileId = this.getProfileId();
    const preference = await unguess.tables.UserPreferences.do()
      .select("preference_id", "name", "value")
      .where("id", id)
      .andWhere("profile_id", profileId)
      .first();
    if (!preference) return null;

    return preference;
  }

  private async updateOrAssignPreference() {
    const profileId = this.getProfileId();
    const result = await await unguess.raw(
      `
    INSERT INTO user_preferences (profile_id, preference_id, value, change_author_id) 
    VALUES (?, ?, ?, ?) 
    ON DUPLICATE KEY UPDATE 
    value = VALUES(value), 
    change_author_id = VALUES(change_author_id)
  `,
      [profileId, this.preference_id, newValue, profileId]
    );
    return result;
  }
}
