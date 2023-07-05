/** OPENAPI-CLASS: post-workspaces-wid-users */

import { UserExistsException } from "@src/features/class/Invitation";
import { WorkspaceInvitation } from "@src/features/class/Invitation/WorkspaceInvitation";
import WorkspaceRoute from "@src/features/routes/WorkspaceRoute";
import { tryber } from "@src/features/database";

export default class Route extends WorkspaceRoute<{
  response: StoplightOperations["post-workspaces-wid-users"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["post-workspaces-wid-users"]["parameters"]["path"];
  body: StoplightOperations["post-workspaces-wid-users"]["requestBody"]["content"]["application/json"];
}> {
  private locale: Language = "en";
  private workspaceName: string = "workspace";

  constructor(config: RouteClassConfiguration) {
    super(config);
    const { locale } = this.getBody();
    if (this.isLocaleValid(locale)) this.locale = locale;
  }

  get workspaceId() {
    if (!this.workspace_id) throw new Error("workspace_id not defined");
    return this.workspace_id;
  }

  private isLocaleValid(locale?: string): locale is Language {
    return !!locale && ["it", "en"].includes(locale);
  }

  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) return false;

    if (!this.isValidUser()) {
      this.setError(400, {} as OpenapiError);
      return false;
    }

    return true;
  }

  private isValidUser(): boolean {
    return this.getBody().email ? true : false;
  }

  protected async init() {
    await super.init();
    this.workspaceName = this.workspace?.company ?? "workspace";
  }

  protected async prepare() {
    try {
      const invitation = new WorkspaceInvitation({
        userToInvite: {
          email: this.getBody().email,
          name: this.getBody().name,
          surname: this.getBody().surname,
        },
        object: { name: this.workspaceName, id: this.workspaceId },
        email: {
          sender: await this.getEnrichedUser(),
          message: this.getBody().message,
        },
        locale: this.locale,
        redirect: this.getBody().redirect_url,
        event: this.getBody().event_name,
      });
      const result = await invitation.invite();
      return this.setSuccess(200, result);
    } catch (error) {
      if (error instanceof UserExistsException) {
        return this.setError(400, {
          message: "User already exists",
        } as OpenapiError);
      }

      return this.setError(500, {
        message: "Error adding user to campaign",
      } as OpenapiError);
    }
  }

  protected async getEnrichedUser() {
    const sender: UserType & {
      name?: string;
      surname?: string;
    } = this.getUser();
    const user = await tryber.tables.WpAppqEvdProfile.do()
      .select()
      .where({
        id: sender.profile_id,
      })
      .first();

    if (user) {
      sender.name = user.name;
      sender.surname = user.surname;
    }

    return sender;
  }
}
