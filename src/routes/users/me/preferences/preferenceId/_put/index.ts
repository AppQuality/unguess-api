/** OPENAPI-CLASS: put-users-me-preferences-prefid */

import { unguess } from "@src/features/database";
import UserPreferencesRoute from "@src/features/routes/UserPreferencesRoute";
import { ERROR_MESSAGE } from "@src/utils/constants";

export default class Route extends UserPreferencesRoute<{
  response: StoplightOperations["put-users-me-preferences-prefid"]["responses"]["200"]["content"]["application/json"];
  body: StoplightOperations["put-users-me-preferences-prefid"]["requestBody"]["content"]["application/json"];
  parameters: StoplightOperations["put-users-me-preferences-prefid"]["parameters"]["path"];
}> {
  private value: StoplightOperations["put-users-me-preferences-prefid"]["requestBody"]["content"]["application/json"]["value"];

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    this.value = this.getBody().value;
  }

  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) return false;

    if (!this.value && this.value !== 0) {
      this.setError(400, { message: "Value is required" } as OpenapiError);
      return false;
    }

    return true;
  }

  protected async prepare() {
    try {
      const preferenceId = await this.updateOrAssignPreference();
      if (!preferenceId) {
        this.setError(400, {
          message: "Something went wrong, cannot update Preference!",
        } as OpenapiError);
        return;
      }
      const preference = await this.getUserPreference(preferenceId);

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
      .select(
        "user_preferences.preference_id",
        "preferences.name",
        "user_preferences.value"
      )
      .join("preferences", "user_preferences.preference_id", "preferences.id")
      .where("user_preferences.preference_id", id)
      .andWhere("user_preferences.profile_id", profileId)
      .first();
    if (!preference) return null;

    return preference;
  }

  private async updateOrAssignPreference() {
    const profileId = this.getProfileId();
    const existingPreference = await this.getUserPreference(this.preference_id);
    if (!existingPreference) {
      const newPreference = await unguess.tables.UserPreferences.do()
        .insert({
          profile_id: profileId,
          preference_id: this.preference_id,
          value: this.value,
          change_author_id: profileId,
        })
        .returning("preference_id");

      return newPreference[0].preference_id ?? newPreference[0];
    }
    const updatedPreference = await unguess.tables.UserPreferences.do()
      .where({
        profile_id: profileId,
        preference_id: this.preference_id,
      })
      .update({
        value: this.value,
        change_author_id: profileId,
      })
      .returning("preference_id");
    console.log(updatedPreference);
    return updatedPreference[0].preference_id ?? updatedPreference[0];
  }
}
