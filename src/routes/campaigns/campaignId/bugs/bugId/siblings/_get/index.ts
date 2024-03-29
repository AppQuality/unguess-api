/** OPENAPI-CLASS: get-campaigns-bug-siblings */
import * as db from "@src/features/db";
import BugRoute from "@src/features/routes/BugRoute";
import { getBugTitle } from "@src/utils/campaigns";

type Bug = {
  id: number;
  message: string;
  os: string;
  os_version: string;
} & (
  | {
      form_factor: "PC";
      pc_type: string;
    }
  | {
      form_factor: "Smartphone" | "Tablet";
      manufacturer: string;
      model: string;
    }
);
export default class Route extends BugRoute<{
  response: StoplightOperations["get-campaigns-bug-siblings"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-bug-siblings"]["parameters"]["path"];
}> {
  private replication: "unique" | "father" | "children" = "unique";
  private isTitleRuleActive: boolean = false;
  private children: Bug[] | undefined;

  protected async init(): Promise<void> {
    await super.init();

    this.isTitleRuleActive = await this.getTitleRuleStatus();

    if (await this.isChildren()) this.replication = "children";
    else {
      await this.initChildren();
      if (this.children) this.replication = "father";
      else this.replication = "unique";
    }

    if (this.replication === "unique") {
      this.setError(404, {
        code: 404,
        message: "No siblings",
      } as OpenapiError);

      throw new Error("No siblings");
    }
  }

  private async initChildren() {
    const bugs: Bug[] = await db.query(
      `
      SELECT bug.id, bug.message, bug.os, bug.os_version, device.form_factor, device.pc_type, device.manufacturer, device.model
      FROM wp_appq_evd_bug bug
      JOIN wp_crowd_appq_device device ON (device.id = bug.dev_id) 
      WHERE 
      bug.duplicated_of_id = ${this.bug_id} 
      AND bug.publish = 1
      AND bug.status_id IN (${this.acceptedStatuses().join(",")})`
    );
    if (bugs.length) {
      this.children = bugs;
    }
  }

  private async isChildren() {
    return this.getBug().is_duplicated === 1;
  }

  protected async prepare() {
    this.setSuccess(200, {
      father: await this.getFather(),
      siblings:
        this.replication === "father"
          ? await this.getChildren()
          : await this.getSiblings(),
    });
  }

  private async getFather() {
    if (this.replication !== "children") return undefined;
    const bugs: Bug[] = await db.query(
      `
      SELECT bug.id, bug.message, bug.os, bug.os_version, device.form_factor, device.pc_type, device.manufacturer, device.model
        FROM wp_appq_evd_bug bug
        JOIN wp_crowd_appq_device device ON (device.id = bug.dev_id) 
      WHERE 
      bug.id = ${this.getBug().duplicated_of_id}
      AND bug.publish = 1
      AND bug.status_id IN (${this.acceptedStatuses().join(",")})`
    );
    if (!bugs.length) return undefined;
    return this.formatBug(bugs[0]);
  }

  private async getChildren() {
    return (this.children || []).map((bug) => this.formatBug(bug));
  }

  private async getSiblings() {
    if (this.replication !== "children") return [];
    const bugs: Bug[] = await db.query(
      `
      SELECT bug.id, bug.message, bug.os, bug.os_version, device.form_factor, device.pc_type, device.manufacturer, device.model
      FROM wp_appq_evd_bug bug
      JOIN wp_crowd_appq_device device ON (device.id = bug.dev_id) 
      WHERE 
      bug.id != ${this.bug_id} 
      AND bug.publish = 1
      AND bug.duplicated_of_id = ${this.getBug().duplicated_of_id}
      AND bug.status_id IN (${this.acceptedStatuses().join(",")})`
    );
    return bugs.map((bug) => this.formatBug(bug));
  }

  private formatBug(bug: Bug) {
    return {
      id: bug.id,
      title: getBugTitle({
        bugTitle: bug.message,
        hasTitleRule: this.isTitleRuleActive,
      }),
      device:
        bug.form_factor === "PC"
          ? bug.pc_type
          : `${bug.manufacturer} ${bug.model}`,
      os: { name: bug.os, version: bug.os_version },
    };
  }
}
