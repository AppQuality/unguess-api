import * as db from "@src/features/db";
import {
  DT_DESKTOP,
  DT_SMARTPHONE,
  DT_SMARTWATCH,
  DT_TABLET,
  DT_TV,
} from "@src/utils/constants";
import { formatCount } from "@src/utils/paginations";

interface CampaignMeta {
  selected_testers: number;
  allowed_devices: string[];
}

export const getCampaignMeta = async (
  campaign: StoplightComponents["schemas"]["Campaign"] & {
    showNeedReview: boolean;
    formFactors: string;
  }
): Promise<CampaignMeta> => {
  const results = await db.query(
    db.format(
      `SELECT COUNT(user_id) as count FROM wp_crowd_appq_has_candidate WHERE accepted = 1 AND campaign_id = ?`,
      [campaign.id]
    )
  );

  const testers = results.length ? formatCount(results) : 0;

  // Get campaign allowed devices
  const allowed_devices = getCampaignFormFactors(campaign.formFactors).filter(
    (factor) => factor !== ""
  );

  return {
    selected_testers: testers,
    allowed_devices,
  };
};

const getCampaignFormFactors = (factors: string): string[] => {
  const formFactors = factors.split(",");

  return formFactors.map((factor: string) => {
    switch (parseInt(factor)) {
      case DT_SMARTPHONE:
        return "smartphone";
      case DT_TABLET:
        return "tablet";
      case DT_DESKTOP:
        return "desktop";
      case DT_TV:
        return "tv";
      default:
        return "";
    }
  });
};
