export const getCampaignStatus = (
  campaign: StoplightComponents["schemas"]["Campaign"]
): string => {
  const now = new Date().getTime();

  if (campaign.status_id === 2) {
    return "completed";
  } else if (campaign.status_id === 1) {
    if (new Date(campaign.start_date).getTime() > now) {
      return "incoming";
    } else {
      return "running";
    }
  }

  return "running";
};
