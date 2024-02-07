import debugMessage from "@src/features/debugMessage";

export default class Route<T extends RouteClassTypes> {
  private errorMessage: StoplightComponents["responses"]["Error"]["content"]["application/json"] =
    {
      code: 500,
      error: true,
      message: "Generic error",
    };
  private _responseData:
    | T["response"]
    | StoplightComponents["responses"]["Error"]["content"]["application/json"]
    | undefined;

  private body: T["body"] | undefined;
  private parameters: T["parameters"] | undefined;
  protected query: T["query"] | undefined;
  protected response: T["response"] | undefined;
  private id: number | undefined;
  private redirect: string | undefined;

  constructor(
    protected configuration: RouteClassConfiguration & {
      element?: string;
      id?: number;
    }
  ) {
    if (configuration.request.body) this.body = configuration.request.body;
    if (configuration.context.request.params)
      this.parameters = configuration.context.request.params;
    if (configuration.request.query) this.query = configuration.request.query;
  }

  get responseData() {
    if (this.redirect) {
      return this.configuration.response.redirect(this.redirect);
    }
    return this._responseData;
  }

  protected async init() {}
  protected async prepare() {}
  protected async filter() {
    return true;
  }

  protected setRedirect(redirect: string) {
    this.redirect = redirect;
  }

  protected setSuccess(statusCode: number, data: typeof this._responseData) {
    this.configuration.response.status_code = statusCode;
    this._responseData = data;
  }

  protected setError(statusCode: number, error: OpenapiError) {
    this.configuration.response.status_code = statusCode;
    debugMessage(error);

    this._responseData = {
      ...this.errorMessage,
      message: error.message,
      code: statusCode,
    };
  }

  protected setCookie(
    name: string,
    value: string,
    options:
      | {
          secure?: boolean;
          httpOnly?: boolean;
          sameSite?: "none" | "lax" | "strict";
          domain?: string;
        }
      | undefined = {}
  ) {
    this.configuration.response.cookie(name, value, options);
  }

  protected getBody() {
    if (typeof this.body === "undefined") throw new Error("Invalid body");
    return this.body;
  }

  protected getParameters() {
    if (typeof this.parameters === "undefined")
      throw new Error("Invalid parameters");
    return this.parameters;
  }

  protected getQuery() {
    if (typeof this.query === "undefined") throw new Error("Invalid query");
    return this.query;
  }

  protected getResponse() {
    if (typeof this.response === "undefined")
      throw new Error("Invalid response");
    return this.response;
  }

  protected getId() {
    if (typeof this.id === "undefined") throw new Error("No id");
    return this.id;
  }

  protected setId(id: number) {
    this.id = id;
  }

  async resolve() {
    try {
      await this.init();
    } catch (e) {
      return this.responseData;
    }
    if (await this.filter()) {
      await this.prepare();
    }

    return this.responseData;
  }
}
