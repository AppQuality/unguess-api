export const getCampaignOutputs = (
  campaign: StoplightComponents["schemas"]["Campaign"] & {
    media: number;
    bugs: number;
  }
): StoplightComponents["schemas"]["Output"][] => {
  let availableOutputs = [] as StoplightComponents["schemas"]["Output"][];

  //Extract outputs from campaign
  const { media, bugs } = campaign;
  if (media) {
    availableOutputs.push("media");
  }
  if (bugs) {
    availableOutputs.push("bugs");
  }

  return availableOutputs;
};
