import {
  EXPERIENTIAL_CAMPAIGN_TYPE_ID,
  FUNCTIONAL_CAMPAIGN_TYPE_ID,
} from "@src/utils/constants";

export const getCampaignFamily = ({
  familyId,
}: {
  familyId: number;
}): string => {
  let family = "Functional";
  switch (familyId) {
    case EXPERIENTIAL_CAMPAIGN_TYPE_ID:
      family = "Experiential";
      break;
    case FUNCTIONAL_CAMPAIGN_TYPE_ID:
      family = "Functional";
      break;
  }

  return family;
};
