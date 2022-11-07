export const getWidgetBugsByDevices = async (
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

  throw {
    code: 501,
    message: "not implemented",
  };
};
