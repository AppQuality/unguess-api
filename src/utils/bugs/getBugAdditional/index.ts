import * as db from "@src/features/db";

interface AdditionalField {
  id: number;
  name: string;
  value: string;
  validation: string;
  type: "select" | "regex";
}

const prepareField = (
  field: AdditionalField
): StoplightComponents["schemas"]["BugAdditionalField"] => {
  if (field.type === "select") {
    return {
      id: field.id,
      name: field.name,
      value: field.value,
      options: field.validation.split(";"),
      kind: "select",
    };
  } else {
    return {
      id: field.id,
      name: field.name,
      value: field.value,
      validation: field.validation,
      kind: "regex",
    };
  }
};

export const getBugAdditional = async (
  bugId: number
): Promise<StoplightComponents["schemas"]["BugAdditionalField"][] | false> => {
  const results: AdditionalField[] = await db.query(
    db.format(
      `SELECT f.id, f.title as name, d.value, f.validation, f.type
       from wp_appq_campaign_additional_fields_data d
       JOIN wp_appq_campaign_additional_fields f ON (d.type_id = f.id)
       WHERE bug_id = ?`,
      [bugId]
    )
  );

  // Check if bug exists
  if (!results) {
    return false;
  }

  return results.map(prepareField) || [];
};
