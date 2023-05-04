/** OPENAPI-CLASS: post-workspaces */

import { tryber } from "@src/features/database";
import UserRoute from "@src/features/routes/UserRoute";
import { ERROR_MESSAGE, fallBackCsmProfile } from "@src/utils/constants";

export default class Route extends UserRoute<{
  body: StoplightOperations["post-workspaces"]["requestBody"]["content"]["application/json"];
  response: StoplightOperations["post-workspaces"]["responses"]["200"]["content"]["application/json"];
}> {
  private companyName: string;
  private pmId: number = fallBackCsmProfile.id;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);

    const body = this.getBody();
    this.companyName = body.company;

    if (body.pm_id) this.pmId = body.pm_id;
  }

  protected async filter(): Promise<boolean> {
    if (!super.filter()) return false;

    if (!this.isAdmin()) {
      this.setError(403, {
        message: ERROR_MESSAGE,
      } as OpenapiError);
      return false;
    }
    return true;
  }

  protected async prepare() {
    try {
      const customer = await tryber.tables.WpAppqCustomer.do()
        .insert({
          company: this.companyName,
          pm_id: this.pmId,
        })
        .returning(["id", "company"]);

      this.setSuccess(200, {
        id: customer[0].id,
        company: customer[0].company,
      });
    } catch (error) {
      this.setError(500, {
        message: ERROR_MESSAGE,
      } as OpenapiError);
    }
  }

  private isAdmin() {
    return this.getUser().role === "administrator";
  }
}
