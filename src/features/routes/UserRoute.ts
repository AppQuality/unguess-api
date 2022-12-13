import Route from "./Route";

export default class UserRoute<T extends RouteClassTypes> extends Route<T> {
  private userId: number;
  private tryberWpId: number;
  private unguessWpId: number;
  private user: UserType;

  constructor(
    configuration: RouteClassConfiguration & {
      element?: string;
      id?: number;
    }
  ) {
    super({
      ...configuration,
      id: configuration.request.user.id,
    });
    this.userId = this.configuration.request.user.id;
    this.tryberWpId = this.configuration.request.user.tryber_wp_user_id;
    this.unguessWpId = this.configuration.request.user.unguess_wp_user_id;
    this.user = this.configuration.request.user;
  }

  protected getUser() {
    return this.user;
  }
  protected getUserId() {
    return this.userId;
  }
  protected getWordpressId(site?: "tryber" | "unguess") {
    if (site === "tryber") return this.tryberWpId;
    return this.unguessWpId;
  }
}
