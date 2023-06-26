import { tryber } from "@src/features/database";
import { Invitation } from ".";

type InvitationArgs = GetConstructorArgs<typeof Invitation>[0];

export class CampaignInvitation extends Invitation {
  private campaignId: number;

  constructor(
    params: InvitationArgs & {
      object: InvitationArgs["object"] & { id: number };
    }
  ) {
    super(params);
    this.campaignId = params.object.id;
  }

  protected getTemplate() {
    if (this.customEvent) return this.customEvent;

    const templates = {
      existing_user: `campaign_existent_invitation_${this.locale}`,
      new_user: `campaign_invitation_${this.locale}`,
    };
    return templates[this.type];
  }

  protected async retrieveUserAlreadyInvited() {
    const user = await tryber.tables.WpAppqUserToCampaign.do()
      .select(
        tryber.ref("id").withSchema("wp_appq_evd_profile").as("profile_id"),
        tryber
          .ref("wp_user_id")
          .withSchema("wp_appq_evd_profile")
          .as("tryber_wp_id"),
        tryber.ref("email").withSchema("wp_appq_evd_profile"),
        tryber
          .ref("status")
          .withSchema("wp_appq_customer_account_invitations")
          .as("invitation_status")
      )
      .join(
        "wp_appq_evd_profile",
        "wp_appq_user_to_campaign.wp_user_id",
        "wp_appq_evd_profile.wp_user_id"
      )
      .leftJoin(
        "wp_appq_customer_account_invitations",
        "wp_appq_evd_profile.id",
        "wp_appq_customer_account_invitations.tester_id"
      )
      .where("wp_appq_user_to_campaign.campaign_id", this.campaignId)
      .where("wp_appq_evd_profile.email", this.email)
      .groupBy("wp_appq_evd_profile.id")
      .first();

    if (!user) return null;

    return {
      ...user,
      type: !!(
        user.invitation_status && Number.parseInt(user.invitation_status) !== 1
      )
        ? ("new_user" as const)
        : ("existing_user" as const),
    };
  }

  protected async addUserToResource(user: {
    tryber_wp_id: number;
  }): Promise<void> {
    const { tryber_wp_id } = user;
    await tryber.tables.WpAppqUserToCampaign.do().insert({
      wp_user_id: tryber_wp_id,
      campaign_id: this.campaignId,
    });
  }
}
