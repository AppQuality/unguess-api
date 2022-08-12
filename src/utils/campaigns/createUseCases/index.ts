import * as db from "@src/features/db";
import { UseCaseParams } from "@src/__mocks__/database/use_cases";

export const createUseCases = async (
  use_cases?: Array<StoplightComponents["schemas"]["UseCase"]>
): Promise<
  Array<{ id: number } & StoplightComponents["schemas"]["UseCase"]>
> => {
  if (!use_cases || !use_cases.length) return [];

  const defaultUseCase: UseCaseParams = {
    title: "???",
    content: "???",
    campaign_id: -1,
    is_required: 1,
    jf_code: "",
    jf_text: "",
    group_id: 1,
    position: 0,
    allow_media: 0,
    optimize_media: 0,
  };

  const allowedFields = Object.keys(defaultUseCase);

  let insert_sql =
    `INSERT INTO wp_appq_campaign_task (` +
    Object.keys(defaultUseCase).join(",") +
    `) VALUES`;

  const results: Array<
    { id: number } & StoplightComponents["schemas"]["UseCase"]
  > = [];

  // Insert use cases, singolarly because we need to know the id of the new use case
  use_cases.forEach(async (use_case) => {
    const values = getUCFieldsFromTemplate(
      {
        ...defaultUseCase,
        ...use_case,
        ...(use_case.description && { content: use_case.description }),
      },
      allowedFields
    );
    const sql = insert_sql + ` (${values.join(",")})`;

    try {
      const response = await db.query(sql);

      const id = getId(response);

      if (response && id) {
        results.push({
          id: id,
          ...use_case,
        });
      }
    } catch (error) {
      if (process.env && process.env.DEBUG) {
        console.log("Something went wrong in uc creation: ", error);
      }
    }
  });

  return results;
};

const getId = (response: {
  changes?: number;
  lastInsertRowid?: number;
  insertId?: number;
}) => {
  return response.insertId || response.lastInsertRowid || false;
};

const getUCFieldsFromTemplate = (
  template: any,
  keys: Array<string>
): Array<string | number> => {
  const fields: Array<string | number> = [];

  keys.forEach((key) => {
    if (key in template) {
      const value = template[key];
      fields.push(typeof value === "string" ? db.format(`?`, [value]) : value);
    }
  });

  return fields;
};
