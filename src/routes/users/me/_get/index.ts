/** OPENAPI-CLASS: get-users-me */
import * as db from "@src/features/db";
import { getGravatar } from "@src/utils/users";
import getUserFeatures from "@src/features/wp/getUserFeatures";
import UserRoute from "@src/features/routes/UserRoute";

export default class Route extends UserRoute<{
  response: StoplightOperations["get-users-me"]["responses"]["200"]["content"]["application/json"];
}> {
  protected async prepare() {
    const user = this.getUser();
    const picUrl = await getGravatar(user.email);
    const features = await getUserFeatures(this.getWordpressId("unguess"));

    this.setSuccess(200, {
      id: user.id,
      email: user.email,
      role: user.role,
      profile_id: user.profile_id,
      tryber_wp_user_id: user.tryber_wp_user_id,
      unguess_wp_user_id: user.unguess_wp_user_id,
      name: await this.getProfileName(),
      ...(picUrl && { picture: picUrl }),
      ...(features && { features: features }),
    });
  }

  private async getProfileName() {
    const profile: { name: string; surname: string }[] = await db.query(
      db.format(`SELECT name,surname FROM wp_appq_evd_profile WHERE id = ?`, [
        this.getUserId(),
      ]),
      "tryber"
    );

    if (!profile.length) return "name surname";

    return `${profile[0].name} ${profile[0].surname}`;
  }
}
