/** OPENAPI-CLASS: get-campaigns-bug-siblings */
import * as db from "@src/features/db";
import BugRoute from "@src/features/routes/BugRoute";
import { getBugTitle } from "@src/utils/campaigns";

export default class Route extends BugRoute<{
  response: StoplightOperations["get-campaigns-bug-siblings"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-bug-siblings"]["parameters"]["path"];
}> {
  private replication: "unique" | "father" | "children" = "unique";
  private isTitleRuleActive: boolean = false;

  protected async init(): Promise<void> {
    await super.init();

    this.isTitleRuleActive = await this.getTitleRuleStatus();
    this.replication = await this.getReplicationStatus();

    if (this.replication === "unique") {
      this.setError(404, {
        code: 404,
        message: "No siblings",
      } as OpenapiError);

      throw new Error("No siblings");
    }
  }

  private async getReplicationStatus() {
    if (await this.isChildren()) return "children";
    if (await this.isFather()) return "father";
    return "unique";
  }

  private async isChildren() {
    const bugs = await db.query(
      `SELECT is_duplicated FROM wp_appq_evd_bug WHERE id = ${this.bug_id}`
    );
    return bugs[0].is_duplicated === 1;
  }

  private async isFather() {
    const bugs = await db.query(
      `SELECT id FROM wp_appq_evd_bug WHERE duplicated_of_id = ${this.bug_id}`
    );
    return bugs.length > 0;
  }

  protected async prepare() {
    this.setSuccess(200, {
      father: await this.getFather(),
      siblings: [],
    });
  }

  private async getFather() {
    if (this.replication !== "children") return undefined;
    const bugs = await db.query(
      `SELECT id, message FROM wp_appq_evd_bug WHERE id = (
        SELECT duplicated_of_id FROM wp_appq_evd_bug WHERE id = ${this.bug_id}
      )`
    );
    if (!bugs.length) return undefined;

    return {
      id: bugs[0].id,
      title: getBugTitle({
        bugTitle: bugs[0].message,
        hasTitleRule: this.isTitleRuleActive,
      }),
      device: "",
      os: { name: "", version: "" },
    };
  }
}
