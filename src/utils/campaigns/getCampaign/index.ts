import * as db from "@src/features/db";
import { getCampaignFamily } from "../getCampaignFamily";
import { getCampaignOutputs } from "../getCampaignOutputs";
import { getCampaignStatus } from "../getCampaignStatus";

export const getCampaign = async ({
  campaignId,
  withOutputs,
}: {
  campaignId: number;
  withOutputs?: boolean;
}): Promise<StoplightComponents["schemas"]["Campaign"] | false> => {
  const result = await db.query(
    db.format(
      `SELECT 
      c.id,  
      c.start_date,  
      c.end_date,
      c.close_date,
      c.title,
      c.description,
      c.base_bug_internal_id,
      c.customer_title,
      c.status_id,
      c.is_public,
      c.campaign_type_id,
      c.project_id,
      c.customer_id,
      c.campaign_type AS bug_form,
      ct.name AS campaign_type_name,
      ct.type AS campaign_family_id,
      ${withOutputs ? "o.bugs, o.media," : ""}
      p.display_name 
      FROM wp_appq_evd_campaign c 
      JOIN wp_appq_project p ON c.project_id = p.id 
      JOIN wp_appq_campaign_type ct ON c.campaign_type_id = ct.id
      ${
        withOutputs
          ? "LEFT JOIN campaigns_outputs o ON (o.campaign_id = c.id)"
          : ""
      }
      WHERE c.id = ?
      GROUP BY c.id`,
      [campaignId]
    )
  );

  const campaign = result[0];

  // Check if campaign exists
  if (!campaign) {
    return false;
  }

  // Get campaign family
  const campaign_family = getCampaignFamily({
    familyId: campaign.campaign_family_id,
  });

  // Get campaign outputs
  const outputs = withOutputs ? getCampaignOutputs(campaign) : false;

  return {
    id: campaign.id,
    start_date: campaign.start_date.toString(),
    end_date: campaign.end_date.toString(),
    close_date: campaign.close_date.toString(),
    title: campaign.title,
    customer_title: campaign.customer_title,
    is_public: campaign.is_public,
    bug_form: campaign.bug_form,
    type: {
      id: campaign.campaign_type_id,
      name: campaign.campaign_type_name,
    },
    status: {
      id: campaign.status_id,
      name: getCampaignStatus(campaign),
    },
    family: {
      id: campaign.campaign_family_id,
      name: campaign_family,
    },
    project: {
      id: campaign.project_id,
      name: campaign.display_name,
    },
    description: campaign.description,
    ...(campaign.base_bug_internal_id && {
      base_bug_internal_id: campaign.base_bug_internal_id,
    }),
    ...(withOutputs && { outputs: outputs }),
  };
};
