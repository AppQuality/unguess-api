import * as db from "@src/features/db";
import { getCampaignFamily } from "../getCampaignFamily";
import { getCampaignStatus } from "../getCampaignStatus";

export const getCampaign = async ({
  campaignId,
  withOutputs,
}: {
  user: UserType;
  campaignId: number;
  withOutputs?: boolean;
}): Promise<
  | (StoplightComponents["schemas"]["Campaign"] & {
      showNeedReview: boolean;
      formFactors: string;
    })
  | false
> => {
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
      c.form_factor as formFactors,
      c.customer_id,
      c.cust_bug_vis as showNeedReview,
      c.campaign_type AS bug_form,
      ct.name AS campaign_type_name,
      ct.type AS campaign_family_id,
      p.display_name 
      FROM wp_appq_evd_campaign c 
      JOIN wp_appq_project p ON c.project_id = p.id 
      JOIN wp_appq_campaign_type ct ON c.campaign_type_id = ct.id
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
    showNeedReview: campaign.showNeedReview === 1 ? true : false,
    ...(withOutputs && {
      outputs: await getCampaignOutputs(campaign),
    }),
    formFactors: campaign.formFactors || "0",
  };
};

async function getCampaignOutputs(campaign: {
  id: number;
  showNeedReview: boolean;
}) {
  let outputs: ("media" | "bugs")[] = [];

  if (await hasBugs()) {
    outputs.push("bugs");
  }

  if (await hasMedia()) {
    outputs.push("media");
  }
  return outputs;

  async function hasBugs() {
    const bugs = await db.query(
      db.format(
        `SELECT COUNT(id) as total 
        FROM wp_appq_evd_bug 
        WHERE campaign_id = ?
        AND publish = 1
        AND ${
          campaign.showNeedReview
            ? "(status_id = 2 OR status_id = 4)"
            : "status_id = 2"
        }`,
        [campaign.id]
      )
    );
    return bugs.length && bugs[0].total > 0;
  }

  async function hasMedia() {
    const media = await db.query(
      db.format(
        `SELECT COUNT(t.id) as total
          FROM wp_appq_campaign_task t 
          JOIN wp_appq_user_task_media m ON (m.campaign_task_id = t.id)
          WHERE t.campaign_id = ? AND m.status = 2`,
        [campaign.id]
      )
    );
    return media.length && media[0].total > 0;
  }
}
