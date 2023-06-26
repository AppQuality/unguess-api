import { tryber } from "@src/features/database";
import { sendTemplate } from "@src/features/mail/sendTemplate";
import createTryberWPUser from "@src/features/wp/createTryberWPUser";
import createUserProfile from "@src/features/wp/createUserProfile";
import { randomString } from "@src/utils/users/getRandomString";
import crypto from "crypto";

type InvitationType = "new_user" | "existing_user";
type Language = "it" | "en";

const SUBJECTS: Record<InvitationType, Record<Language, string>> = {
  new_user: {
    it: `Entra in Unguess`,
    en: `You've been invited to join UNGUESS`,
  },
  existing_user: {
    it: `Entra in %%object_name%%`,
    en: `You've been invited to join %%object_name%%`,
  },
};

class Invitation {
  private objectName: string;
  private templates: Record<InvitationType, string>;
  private subjects: Record<InvitationType, string>;
  private locale: Language = "en";
  private redirect: string = process.env.APP_URL ?? "/";
  private message: string = "";
  private type: InvitationType = "new_user";
  private email: string;
  private baseUrl: string;
  private userToInvite: { email: string; name?: string; surname?: string };
  private sender: UserType;

  constructor({
    object,
    userToInvite,
    locale,
    email,
    redirect,
  }: {
    object: { name: string };
    userToInvite: { email: string; name?: string; surname?: string };
    email: {
      sender: UserType;
      templates: Record<InvitationType, string>;
      subjects: Record<InvitationType, string>;
      message?: string;
    };
    locale?: string;
    redirect?: string;
  }) {
    this.objectName = object.name;
    this.email = userToInvite.email;
    this.userToInvite = userToInvite;
    this.templates = email.templates;
    this.sender = email.sender;
    this.subjects = email.subjects;
    if (this.isLocaleValid(locale)) this.locale = locale;

    this.baseUrl = `${process.env.APP_URL}${
      this.locale !== "en" ? `/${this.locale}` : ""
    }`;
    if (redirect) this.redirect = redirect;
    if (email.message) this.message = email.message;
  }

  private isLocaleValid(locale?: string): locale is Language {
    return !!locale && ["it", "en"].includes(locale);
  }

  public async sendNewUserInvitation({ profile_id }: { profile_id: number }) {
    const inviteUrl = await this.createInvitation({
      profile_id: profile_id,
    });
    await this.notifyUser({
      params: {
        "{Inviter.url}": inviteUrl,
      },
    });
  }

  private async notifyUser({
    params = {},
  }: {
    params?: { [key: string]: string };
  }) {
    await sendTemplate({
      email: this.email,
      template: this.templates[this.type],
      subject: this.subjects[this.type],
      optionalFields: {
        "{Inviter.name}": this.sender.email,
        "{Inviter.email}": this.sender.email,
        "{Inviter.subject}": this.objectName,
        "{Inviter.redirectUrl}": this.redirect,
        "{Inviter.inviteText}": this.message,
        ...params, // additional fields
      },
    });
  }

  private async createInvitation({ profile_id }: { profile_id: number }) {
    const token = crypto
      .createHash("sha256")
      .update(`${profile_id}_AppQ`)
      .digest("hex");

    await tryber.tables.WpAppqCustomerAccountInvitations.do()
      .insert({
        tester_id: profile_id,
        status: "0",
        token: token,
      })
      .onConflict("tester_id")
      .merge();

    return `${this.baseUrl}/invites/${profile_id}/${token}`;
  }

  private async getUserByEmail() {
    const alreadyRegisteredEmail = await tryber.tables.WpUsers.do()
      .select(
        tryber.ref("ID").withSchema("wp_users").as("tryber_wp_id"),
        tryber.ref("id").withSchema("wp_appq_evd_profile").as("profile_id"),
        tryber.ref("name").withSchema("wp_appq_evd_profile"),
        tryber.ref("surname").withSchema("wp_appq_evd_profile"),
        tryber.ref("email").withSchema("wp_appq_evd_profile"),
        tryber
          .ref("status")
          .withSchema("wp_appq_customer_account_invitations")
          .as("invitation_status")
      )
      .join(
        "wp_appq_evd_profile",
        "wp_users.ID",
        "wp_appq_evd_profile.wp_user_id"
      )
      .leftJoin(
        "wp_appq_customer_account_invitations",
        "wp_appq_evd_profile.id",
        "wp_appq_customer_account_invitations.tester_id"
      )
      .where({
        user_email: this.email,
      })
      .first();

    return alreadyRegisteredEmail;
  }

  private async getUserToAdd() {
    const userExists = await this.getUserByEmail();
    if (userExists) {
      return { ...userExists, newUser: false };
    }

    try {
      const userToAdd = await this.createUser();
      return { ...userToAdd, newUser: true };
    } catch (e) {
      this.removeCreatedUser();
      throw e;
    }
  }
  private async removeCreatedUser() {
    const user = await this.getUserByEmail();

    if (user) {
      await tryber.tables.WpAppqUserToCustomer.do().delete().where({
        wp_user_id: user.tryber_wp_id,
      });
    }

    // Remove user profiles (if any)
    await tryber.tables.WpUsers.do().delete().where({
      user_email: this.email,
    });

    await tryber.tables.WpAppqEvdProfile.do().delete().where({
      email: this.email,
    });
  }

  private async createUser() {
    const { name = "", surname = "" } = this.userToInvite;
    const psw = randomString(12);
    const username =
      name && surname ? `${name}-${surname}` : this.email.split("@")[0];

    const tryber_wp_id = await createTryberWPUser(username, this.email, psw);

    const profile = await createUserProfile({
      tryber_wp_id,
      name,
      surname,
      email: this.email,
    });

    if (!profile) throw new Error("Error creating user profile");

    return {
      tryber_wp_id,
      profile_id: profile.profile_id,
      name,
      surname,
      email: this.email,
      invitation_status: "0",
    };
  }

  public async createAndInviteUser() {
    const userToAdd = await this.getUserToAdd();
    if (userToAdd.newUser) {
      await this.sendNewUserInvitation({
        profile_id: userToAdd.profile_id,
      });
    } else {
      const userHasPendingInvitation =
        userToAdd.invitation_status &&
        Number(userToAdd.invitation_status) === 0;

      if (!userHasPendingInvitation) this.type = "existing_user";
      await this.notifyUser({});
    }

    return userToAdd;
  }
}

export { Invitation };
