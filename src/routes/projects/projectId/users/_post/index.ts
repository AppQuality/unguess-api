/** OPENAPI-CLASS: post-projects-pid-users */
import { UserExistsException } from "@src/features/class/Invitation";
import { ProjectInvitation } from "@src/features/class/Invitation/ProjectInvitation";
import { tryber } from "@src/features/database";
import ProjectRoute from "@src/features/routes/ProjectRoute";

export default class Route extends ProjectRoute<{
  response: StoplightOperations["post-projects-pid-users"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["post-projects-pid-users"]["parameters"]["path"];
  body: StoplightOperations["post-projects-pid-users"]["requestBody"]["content"]["application/json"];
}> {
  private locale: Language = "en";
  private projectName: string = "project";

  constructor(config: RouteClassConfiguration) {
    super(config);
    const { locale } = this.getBody();
    if (this.isLocaleValid(locale)) this.locale = locale;
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
    this.projectName = this.project?.name ?? "project";
  }

  protected async prepare() {
    try {
      const invitation = new ProjectInvitation({
        userToInvite: {
          email: this.getBody().email,
          name: this.getBody().name,
          surname: this.getBody().surname,
        },
        object: { name: this.projectName, id: this.project_id },
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
