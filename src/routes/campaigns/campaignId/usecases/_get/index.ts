/** OPENAPI-CLASS: get-campaigns-cid-usecases */

import CampaignRoute from "@src/features/routes/CampaignRoute";
import * as db from "@src/features/db";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-usecases"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-usecases"]["parameters"]["path"];
}> {
  protected async prepare(): Promise<void> {
    const cpId = this.cp_id;
    const bugsNotInUsecase = await db.query(`
      SELECT id
      FROM wp_appq_evd_bug
      WHERE campaign_id = ${cpId} 
        AND publish = 1
        AND status_id IN (${this.showNeedReview ? "2,4" : "2"})
        AND application_section_id = -1
    `);

    const usecases = await db.query(`
    SELECT usecase.id, usecase.title, usecase.simple_title as simple, usecase.prefix, usecase.info
      FROM wp_appq_campaign_task usecase
        JOIN wp_appq_evd_bug bug ON usecase.id = bug.application_section_id
      WHERE usecase.campaign_id = ${cpId} 
        AND bug.campaign_id = ${cpId} 
        AND bug.publish = 1
        AND bug.status_id IN (${this.showNeedReview ? "2,4" : "2"})
  `);
    const campaignUsecases = usecases.map(
      (usecase: {
        id: number;
        title: string;
        simple: string;
        prefix: string;
        info: string;
      }) => {
        return {
          id: usecase.id,
          title: {
            full: usecase.title,
            simple: usecase.simple ? usecase.simple : undefined,
            prefix: usecase.prefix ? usecase.prefix : undefined,
            info: usecase.info ? usecase.info : undefined,
          },
          completion: 1,
        };
      }
    );
    if (bugsNotInUsecase.length)
      campaignUsecases.push({
        id: -1,
        title: { full: "Not a specific Usecase" },
        completion: 1,
      });
    return this.setSuccess(200, campaignUsecases);
  }
}
