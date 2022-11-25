import { formatUseCaseProgress } from "./formatProgress";
import { getUseCaseProgress } from "./getUseCaseProgress";

// UC allowed responses 12.5 | 37.5 | 62.5 | 87.5
const getWidgetUseCaseProgress = async (
  cp: StoplightComponents["schemas"]["CampaignWithOutput"]
): Promise<12.5 | 37.5 | 62.5 | 87.5 | 100> => {
  const { groups, usecases } = await getUseCaseProgress(cp.id);

  if (!usecases.length || !groups[0]) {
    return formatUseCaseProgress();
  }

  const completion = {
    expected: 0,
    actual: 0,
  };

  usecases.forEach((useCase: { group_id: number; completions: number }) => {
    completion.expected += groups[useCase.group_id];
    completion.actual += useCase.completions;
  });

  if (completion.expected === 0 || completion.actual === 0)
    return formatUseCaseProgress();

  const progress = (completion.actual / completion.expected) * 100;

  return formatUseCaseProgress(progress);
};

export const getWidgetCampaignProgress = async (
  campaign: StoplightComponents["schemas"]["CampaignWithOutput"]
): Promise<StoplightComponents["schemas"]["WidgetCampaignProgress"]> => {
  const useCaseProgress = await getWidgetUseCaseProgress(campaign);

  const startDate = new Date(campaign.start_date);
  const endDate = new Date(campaign.end_date);

  const isDatesOK = startDate && endDate && startDate < endDate;

  const now = new Date();

  const expDuration = isDatesOK ? endDate.getTime() - startDate.getTime() : 0;
  const actDuration =
    !isDatesOK || campaign.status.name === "completed"
      ? expDuration
      : now.getTime() - startDate.getTime();

  const response: StoplightComponents["schemas"]["WidgetCampaignProgress"] = {
    data: {
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      usecase_completion: useCaseProgress,
      time_elapsed: actDuration,
      expected_duration: expDuration,
    },
    kind: "campaignProgress",
  };

  return response;
};
