export const getCampaignOutputs = (
  campaign: StoplightComponents["schemas"]["Campaign"] & {
    media: number;
    bugs: number;
    insights: number;
  }
): StoplightComponents["schemas"]["Output"][] => {
  let availableOutputs = [] as StoplightComponents["schemas"]["Output"][];

  //Extract outputs from campaign
  const { media, bugs, insights } = campaign;
  if (media) {
    availableOutputs.push("media");
  }
  if (bugs) {
    availableOutputs.push("bugs");
  }

  if (insights) {
    availableOutputs.push("insights");
  }

  return availableOutputs;
};
