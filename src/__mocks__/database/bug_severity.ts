import Table from "./tryber_table";

type BugSeverityParams = {
  id?: number;
  name?: string;
  description?: string;
};

const defaultItem: BugSeverityParams = {
  name: "???",
  description: "???",
};
class Severities extends Table<BugSeverityParams> {
  protected name = "wp_appq_evd_severity";
  protected columns = [
    "id INTEGER PRIMARY KEY NOT NULL",
    "name VARCHAR(45)",
    "description VARCHAR(512)",
  ];
  constructor() {
    super(defaultItem);
  }

  async addDefaultItems() {
    await this.insert({
      id: 1,
      name: "LOW",
      description:
        "Issues that have a minimal impact on the use of the product: when the user is always and in any case able to continue to use and test the product without feeling particularly annoyed. Often these are USABILITY, TYPO or GRAPHIC bugs.",
    });

    await this.insert({
      id: 2,
      name: "MEDIUM",
      description:
        "Issues that have a limited impact on the use of the product: when the user is still able to complete the process while remaining only partially upset. This can be any type of bug.",
    });

    await this.insert({
      id: 3,
      name: "HIGH",
      description:
        "Issues that have a significant impact in the use of the product: they usually occur in the main sections and the user may not be able to continue using and testing the product as intended and/or would get upset and limited. Generally, the bug type is MALFUNCTION, CRASH, PERFORMANCE or SECURITY.",
    });

    await this.insert({
      id: 4,
      name: "CRITICAL",
      description:
        "Issues that prevent the tester from completing the main tasks, often resulting in a system crash. The user is in unable to continue using the test object as he wishes. The bug types are either MALFUNCTION or CRASH bugs.",
    });
  }
}
const severities = new Severities();
export default severities;
export type { BugSeverityParams };
