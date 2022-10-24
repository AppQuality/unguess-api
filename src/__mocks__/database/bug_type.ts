import Table from "./tryber_table";

type BugTypeParams = {
  id?: number;
  name?: string;
  description?: string;
  is_enabled?: number;
};

const defaultItem: BugTypeParams = {
  name: "???",
  description: "???",
  is_enabled: 1,
};
class Types extends Table<BugTypeParams> {
  protected name = "wp_appq_evd_bug_type";
  protected columns = [
    "id INTEGER PRIMARY KEY NOT NULL",
    "name VARCHAR(45)",
    "description VARCHAR(512)",
    "is_enabled INT(1) NOT NULL DEFAULT 1",
  ];
  constructor() {
    super(defaultItem);
  }

  async addDefaultItems() {
    await this.insert({
      id: 1,
      name: "Crash",
      description:
        "Issues related to unresponsive and/or crashing software. When the user needs to reset or relaunch it to keep using it (i.e. apps closing unexpectedly, neverending loadings, 404 error pages,...).",
    });

    await this.insert({
      id: 3,
      name: "Graphic",
      description:
        "Issues related to the visual aspect of the product, such as overlapping elements, wrong contrast, incoherent elements, cut or blurry text or media, elements that are either out of the screen or partially not visible/overlapped.",
    });

    await this.insert({
      id: 5,
      name: "Performance",
      description:
        "Issues strictly related to the contents load speed or the completion time processes/actions (lag, slowing down, delays). In the case of a never-ending loading, the correct bug type is CRASH.",
    });

    await this.insert({
      id: 6,
      name: "Malfunction",
      description:
        "Issues related to a wrong functioning or non functioning feature of the product. When the feature works, but the result is different than what the user would expect, the bug type is USABILITY.",
    });

    await this.insert({
      id: 7,
      name: "Typo",
      description:
        "Issues related to grammar mistakes such as spelling, semantics, lexicon, syntax, interrupted sentences (not graphically cut), wrong or incomplete translations, non sense sentenses, visible programming code.",
    });

    await this.insert({
      id: 8,
      name: "Other",
      description: "Issues not listed in the other categories.",
    });

    await this.insert({
      id: 9,
      name: "Security",
      description:
        "Issues solely related to the security and confidentiality of the stored data. This category includes sections with plaintext passwords, lack of login session expiration or even possibility of easily obtaining other users' data through SQL injection or XSS attacks.",
    });

    await this.insert({
      id: 10,
      name: "Usability",
      description:
        "Issues related to the use of the product. When the issue makes it difficult for the user to perform a certain action or task due to long, complex, less than ideal or unintuitive paths. It happens when: the actual functioning completely differs from the users' expectations; there are no checks on data entered in the fields; error messages don't include a explanation of the specific issue (generic error).",
    });
  }
}
const types = new Types();
export default types;
export type { BugTypeParams };
