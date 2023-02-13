import WpAdditionalFields from "@src/features/tables/tryber/WpAppqCampaignAdditionalFields";
import { tryber } from "@src/features/knex";

export const getBugAdditional = async (
  bugId: number
): Promise<StoplightComponents["schemas"]["BugAdditionalField"][] | false> => {
  const results = await WpAdditionalFields.do()
    .select("id", tryber.ref("title").as("name"), "value", "validation", "type")
    .join(
      "wp_appq_campaign_additional_fields_data",
      "wp_appq_campaign_additional_fields.id",
      "wp_appq_campaign_additional_fields_data.type_id"
    )
    .where("bug_id", bugId);

  return results.map((field) => {
    return {
      id: field.id,
      name: field.name,
      value: field.value,
      ...(field.type === "select"
        ? { options: field.validation.split(";"), kind: "select" }
        : { validation: field.validation, kind: "regex" }),
    };
  });
};
