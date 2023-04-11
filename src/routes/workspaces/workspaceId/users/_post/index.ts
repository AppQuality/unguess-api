/** OPENAPI-CLASS: post-workspaces-wid-users */
import WorkspaceRoute from "@src/features/routes/WorkspaceRoute";
import * as db from "@src/features/db";
import createTryberWPUser from "@src/features/wp/createTryberWPUser";
import { randomString } from "@src/utils/users/getRandomString";
import crypto from "crypto";
import { sendTemplate } from "@src/features/mail/sendTemplate";

interface DbUser {
  tryber_wp_id: number;
  profile_id: number;
  name: string;
  surname: string;
  email: string;
  invitation_status: string;
}

interface InvitedUser {
  email: string;
  name?: string;
  surname?: string;
  locale?: string;
}

export default class Route extends WorkspaceRoute<{
  response: StoplightOperations["post-workspaces-wid-users"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["post-workspaces-wid-users"]["parameters"]["path"];
  body: StoplightOperations["post-workspaces-wid-users"]["requestBody"]["content"]["application/json"];
}> {
  private invitedUser: InvitedUser;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    this.invitedUser = this.getBody();
  }

  protected async filter(): Promise<boolean> {
    if (!super.filter()) return false;

    if (!this.isValidUser()) {
      this.setError(400, {} as OpenapiError);
      return false;
    }
    return true;
  }

  protected async prepare() {
    const users = await this.getUsers();
    const user = users.find((u) => u.email === this.invitedUser.email);

    if (user) {
      // user already exists in the workspace
      this.setError(400, { message: "User already exists" } as OpenapiError);
      return;
    }

    const userExists = await this.getUserByEmail(this.invitedUser.email);
    let userToAdd: DbUser = userExists;

    try {
      if (!userToAdd) {
        userToAdd = await this.createUser(this.invitedUser);
        await this.sendInvitation({
          email: userToAdd.email,
          profile_id: userToAdd.profile_id,
          locale: this.invitedUser.locale || "en",
        });
      }

      await this.addUserToWorkspace(userToAdd);
      return this.setSuccess(200, {
        profile_id: userToAdd.profile_id,
        tryber_wp_user_id: userToAdd.tryber_wp_id,
        email: userToAdd.email,
      });
    } catch (e) {
      if (!userExists) this.removeCreatedUser(this.invitedUser.email);

      this.setError(500, {
        message: "Error adding user to workspace",
      } as OpenapiError);
      return;
    }
  }

  private async addUserToWorkspace(user: DbUser): Promise<void> {
    const { tryber_wp_id } = user;

    await db.query(
      db.format(
        `INSERT INTO wp_appq_user_to_customer (wp_user_id, customer_id) VALUES (?, ?)`,
        [tryber_wp_id, this.getWorkspaceId()]
      )
    );
  }

  private async removeCreatedUser(email: string): Promise<void> {
    throw new Error("Not implemented user removal");
  }

  private async getUserByEmail(email: string): Promise<DbUser> {
    const alreadyRegisteredEmail = await db.query(
      db.format(
        `SELECT 
          p.id as profile_id, 
          p.name, 
          p.surname, 
          p.email, 
          wpu.ID as tryber_wp_id 
        FROM wp_users wpu 
          JOIN wp_appq_evd_profile p ON (p.wp_user_id = wpu.ID) 
          WHERE wpu.user_email = ?`,
        [email]
      )
    );

    return alreadyRegisteredEmail.length
      ? {
          ...alreadyRegisteredEmail[0],
          invitation_status: "1",
        }
      : null;
  }

  private async createUser(invitedUser: InvitedUser): Promise<DbUser> {
    const { email, name = "", surname = "" } = invitedUser;
    const psw = randomString(12);
    const username =
      name && surname ? `${name}-${surname}` : email.split("@")[0];

    const tryber_wp_id = await createTryberWPUser(username, email, psw);
    const profile = await db.query(
      db.format(
        `INSERT INTO 
          wp_appq_evd_profile 
          (wp_user_id, name, surname, email, blacklisted, employment_id, education_id) 
          VALUES (?, ?, ?, ?, 1, -1, -1)`,
        [tryber_wp_id, name, surname, email]
      )
    );

    const profile_id = this.getInsertedId(profile);

    return {
      tryber_wp_id,
      profile_id,
      name,
      surname,
      email,
      invitation_status: "0",
    };
  }

  protected async getUsers(): Promise<DbUser[]> {
    const users: DbUser[] = await db.query(
      `SELECT 
        p.id         as profile_id, 
        p.wp_user_id as tryber_wp_id, 
        p.name, 
        p.surname, 
        p.email,
        i.status     as invitation_status
          from wp_appq_user_to_customer utc
        JOIN wp_appq_evd_profile p ON (utc.wp_user_id = p.wp_user_id)
        LEFT JOIN wp_appq_customer_account_invitations i ON (i.tester_id = p.id)
        WHERE utc.customer_id = ${this.getWorkspaceId()}
        GROUP BY p.id
      `
    );

    if (!users) return [];

    return users;
  }

  protected async sendInvitation({
    email,
    profile_id,
    locale,
  }: {
    email: string;
    profile_id: number;
    locale: string;
  }): Promise<void> {
    const token = crypto
      .createHash("sha256")
      .update(`${profile_id}_AppQ`)
      .digest("hex");

    // Add invitation info to db
    await db.query(
      db.format(
        "INSERT INTO wp_appq_customer_account_invitations (tester_id, status, token) VALUES (?, 0, ?)",
        [profile_id, token]
      )
    );

    const subj =
      locale === "it"
        ? `Entra in Unguess`
        : `You've been invited to join UNGUESS`;
    const sender = this.getUser();

    await sendTemplate({
      template: `customer_invitation_${locale}`,
      email: email,
      subject: subj,
      optionalFields: {
        "{Inviter.name}": sender.email,
        "{Inviter.email}": sender.email,
        "{Inviter.url}": `${process.env.APP_URL}/invites/${profile_id}/${token}`,
      },
    });
  }

  protected isValidUser(): boolean {
    if (!this.invitedUser) return false;

    const { email } = this.invitedUser;
    if (!email) return false;

    return true;
  }

  private getInsertedId(insert_result: any): number {
    return insert_result.insertId ?? insert_result.lastInsertRowid;
  }
}
