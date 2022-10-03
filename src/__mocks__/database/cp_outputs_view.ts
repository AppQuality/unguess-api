import View from "./tryber_view";

interface CampaignParams {
  campaign_id?: number;
  bugs?: number;
  media?: number;
}

const viewQuery = `
SELECT b.campaign_id, b.bugs, m.media
FROM wp_appq_evd_campaign c
    LEFT JOIN (SELECT c.id as campaign_id, COUNT(b.id) as bugs
            FROM wp_appq_evd_bug b
            JOIN wp_appq_evd_campaign c ON (c.id = b.campaign_id)
            GROUP BY c.id) b on b.campaign_id = c.id
    LEFT JOIN (SELECT c.id as campaign_id, COUNT(t.id) as media
                     FROM wp_appq_evd_campaign c
                              JOIN wp_appq_campaign_task t ON (t.campaign_id = c.id)
                              JOIN wp_appq_user_task_media m ON (m.campaign_task_id = t.id)
                     GROUP BY c.id
                ) m on (m.campaign_id = c.id)
GROUP BY b.campaign_id`;

class CampaignOutputs extends View<CampaignParams> {
  protected name = "campaigns_outputs";
  protected query = viewQuery;
}
const outputs = new CampaignOutputs();
export default outputs;
export type { CampaignParams };
