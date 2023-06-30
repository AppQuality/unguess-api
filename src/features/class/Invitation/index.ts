import { tryber } from "@src/features/database";
import { sendTemplate } from "@src/features/mail/sendTemplate";
import createTryberWPUser from "@src/features/wp/createTryberWPUser";
import createUserProfile from "@src/features/wp/createUserProfile";
import { randomString } from "@src/utils/users/getRandomString";
import crypto from "crypto";

type InvitationType = "new_user" | "existing_user";

export class UserExistsException extends Error {
  constructor() {
    super("User already exists");
  }
}

class Invitation {
  protected objectName: string;
  protected locale: Language = "en";
  private redirect: string = process.env.APP_URL ?? "/";
  private message: string = "";
  protected type: InvitationType = "new_user";
  protected email: string;
  private baseUrl: string;
  private userToInvite: { email: string; name?: string; surname?: string };
  private sender: UserType & {
    name?: string;
    surname?: string;
  };
  protected customEvent: string | undefined;

  constructor({
    object,
    userToInvite,
    locale,
    email,
    redirect,
    event,
  }: {
    object: { name: string };
    userToInvite: { email: string; name?: string; surname?: string };
    email: {
      sender: UserType;
      message?: string;
    };
    locale?: string;
    redirect?: string;
    event?: string;
  }) {
    this.objectName = object.name;
    this.email = userToInvite.email;
    this.userToInvite = userToInvite;
    this.sender = email.sender;
    if (this.isLocaleValid(locale)) this.locale = locale;

    this.baseUrl = `${process.env.APP_URL}${
      this.locale !== "en" ? `/${this.locale}` : ""
    }`;
    if (redirect) this.redirect = redirect;
    if (email.message) this.message = email.message;
    if (event) this.customEvent = event;
  }

  private isLocaleValid(locale?: string): locale is Language {
    return !!locale && ["it", "en"].includes(locale);
  }

  public async invite() {
    const alreadyInvitedUser = await this.retrieveUserAlreadyInvited();

    if (alreadyInvitedUser) {
      if (alreadyInvitedUser.type === "existing_user") {
        throw new UserExistsException();
      }

      await this.sendNewUserInvitation({
        profile_id: alreadyInvitedUser.profile_id,
      });
      return {
        profile_id: alreadyInvitedUser.profile_id,
        tryber_wp_user_id: alreadyInvitedUser.tryber_wp_id,
        email: alreadyInvitedUser.email,
      };
    }

    const userToAdd = await this.createAndInviteUser();
    await this.addUserToResource(userToAdd);

    return {
      profile_id: userToAdd.profile_id,
      tryber_wp_user_id: userToAdd.tryber_wp_id,
      email: userToAdd.email,
    };
  }

  protected async retrieveUserAlreadyInvited(): Promise<{
    profile_id: number;
    tryber_wp_id: number;
    email: string;
    type: InvitationType;
  } | null> {
    throw new Error("Method not implemented.");
  }

  protected async addUserToResource(user: { tryber_wp_id: number }) {
    throw new Error("Method not implemented.");
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

  public async createAndInviteUser() {
    const userToAdd = await this.getUserToAdd();
    if (userToAdd.newUser) {
      await this.sendNewUserInvitation({
        profile_id: userToAdd.profile_id,
      });
    } else {
      if (userToAdd.pendingToken) {
        await this.notifyUser({
          params: {
            "{Inviter.url}": this.getInvitationUrl({
              profile_id: userToAdd.profile_id,
              token: userToAdd.pendingToken,
            }),
          },
        });
      } else {
        this.type = "existing_user";
        await this.notifyUser({});
      }
    }

    return userToAdd;
  }

  private async notifyUser({
    params = {},
  }: {
    params?: { [key: string]: string };
  }) {
    await sendTemplate({
      email: this.email,
      template: this.getTemplate(),
      subject: this.getSubject(),
      optionalFields: {
        "{Inviter.name}":
          this.sender.name && this.sender.surname
            ? this.sender.name + " " + this.sender.surname
            : this.sender.email,
        "{Inviter.email}": this.sender.email,
        "{Inviter.subject}": this.objectName,
        "{Inviter.redirectUrl}": this.redirect,
        "{Inviter.inviteText}": this.message,
        ...params, // additional fields
      },
    });
  }

  protected getTemplate(): string {
    throw new Error("Method not implemented.");
  }

  protected getSubject() {
    const subjects = {
      existing_user:
        this.locale === "it"
          ? `Entra in ${this.objectName}`
          : `You've been invited to join ${this.objectName}`,
      new_user:
        this.locale === "it"
          ? `Entra in Unguess`
          : `You've been invited to join UNGUESS`,
    };

    return subjects[this.type];
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

    return this.getInvitationUrl({ profile_id, token });
  }

  private getInvitationUrl({
    profile_id,
    token,
  }: {
    profile_id: number;
    token: string;
  }) {
    return `${this.baseUrl}/invites/${profile_id}/${token}`;
  }

  private async getUserToAdd() {
    const userExists = await this.getUserByEmail();
    if (userExists) {
      const hasPendingInvitation =
        userExists.invitation_status &&
        Number(userExists.invitation_status) === 0;
      return {
        ...userExists,
        newUser: false,
        pendingToken: hasPendingInvitation
          ? userExists.token
          : (false as false),
      };
    }

    try {
      const userToAdd = await this.createUser();
      return {
        ...userToAdd,
        newUser: true,
        pendingToken: false as false,
      };
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
          .as("invitation_status"),
        tryber
          .ref("token")
          .withSchema("wp_appq_customer_account_invitations")
          .as("token")
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
}

export { Invitation };
