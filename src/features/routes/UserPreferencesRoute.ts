import { formatISO } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { tryber, unguess } from "../database";
import UserRoute from "./UserRoute";

export default class UserPreferencesRoute<
  T extends RouteClassTypes
> extends UserRoute<T> {
  protected preference_id: number;
  protected preference:
    | {
        preference_id: number;
        name: string;
        value: number;
      }
    | undefined;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);

    const params = this.getParameters();
    if (!params?.prefid) throw new Error("Missing preference id");
    this.preference_id = Number(params.cmid);
  }

  protected async init(): Promise<void> {
    await super.init();

    if (isNaN(this.preference_id)) {
      this.setError(400, {
        code: 400,
        message: "Invalid preference id",
      } as OpenapiError);

      throw new Error("Invalid comment id");
    }
    const comment = await this.initPreference();
    if (!comment) {
      this.setError(400, {
        code: 400,
        message: "Comment not found",
      } as OpenapiError);

      throw new Error("Comment not found");
    }
  }

  private async initPreference() {
    const profileId = this.getProfileId();
    const preference = await unguess.tables.Preferences.do()
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
      .where("preferences.is_active", 1)
      .andWhere("preferences.id", this.preference_id)
      .first();

    if (!preference) return null;

    this.preference = preference;
    return {
      preference_id: preference.id,
      name: preference.name,
      value: preference.value,
    };
  }

  protected getPreference() {
    return this.preference;
  }
}
