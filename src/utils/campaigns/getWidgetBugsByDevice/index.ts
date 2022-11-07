import { getCampaignBugs } from "../getCampaignBugs";

export const getWidgetBugsByDevice = async (
  campaign: StoplightComponents["schemas"]["CampaignWithOutput"]
): Promise<StoplightComponents["schemas"]["WidgetBugsByDevice"]> => {
  const error = {
    code: 400,
    message: "Something went wrong with bugs-by-device widget",
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  // Widget requires bugs output
  if (!campaign.outputs || !campaign.outputs.includes("bugs")) {
    throw error;
  }

  const bugs = await getCampaignBugs({
    campaignId: campaign.id,
    filterBy: {
      is_duplicated: "0",
    },
  });

  throw {
    code: 501,
    message: "not implemented",
  };
};
