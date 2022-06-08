interface CampaignStatusArgs {
  status_id: number;
  start_date: string;
}

export const getCampaignStatus = (campaign: CampaignStatusArgs): string => {
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
