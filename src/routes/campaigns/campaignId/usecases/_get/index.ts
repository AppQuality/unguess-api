/** OPENAPI-CLASS: get-campaigns-cid-usecases */

import CampaignRoute from "@src/features/routes/CampaignRoute";
import * as db from "@src/features/db";
import { getUseCaseProgress } from "@src/utils/campaigns/getWidgetCampaignProgress/getUseCaseProgress";
import { getSingleUseCaseCompletion } from "@src/utils/campaigns/getWidgetBugsByUseCase";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-usecases"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-usecases"]["parameters"]["path"];
}> {
  protected async prepare(): Promise<void> {
    const usecases = await this.getUsecases();
    const enhancedUsecases = await this.enhancedUsecases(usecases);
    const campaignUsecases = this.formatUsecases(enhancedUsecases);
    return this.setSuccess(200, campaignUsecases);
  }

  private async getUsecases() {
    const result: {
      id: number;
      title: string;
      simple: string | null;
      info: string | null;
      prefix: string | null;
    }[] = await db.query(`
    SELECT usecase.id, usecase.title, usecase.simple_title as simple, usecase.prefix, usecase.info
      FROM wp_appq_campaign_task usecase
        JOIN wp_appq_evd_bug bug ON usecase.id = bug.application_section_id
        JOIN wp_appq_evd_bug_status status ON bug.status_id = status.id
      WHERE usecase.campaign_id = ${this.cp_id} 
        AND bug.campaign_id = ${this.cp_id} 
        AND bug.publish = 1
        AND ${
          this.shouldShowNeedReview()
            ? `(status.name = 'Approved' OR status.name = 'Need Review')`
            : `status.name = 'Approved'`
        }
  `);
    if (await this.hasBugNotInUsecases())
      result.push({
        id: -1,
        title: "Not a specific Usecase",
        simple: null,
        info: null,
        prefix: null,
      });
    return result;
  }

  private async hasBugNotInUsecases() {
    const result = await db.query(`
      SELECT bug.id
      FROM wp_appq_evd_bug bug
      JOIN wp_appq_evd_bug_status status ON bug.status_id = status.id
      WHERE bug.campaign_id = ${this.cp_id} 
      AND bug.publish = 1
      AND ${
        this.shouldShowNeedReview()
          ? `(status.name = 'Approved' OR status.name = 'Need Review')`
          : `status.name = 'Approved'`
      }
        AND bug.application_section_id = -1
    `);
    return result.length > 0;
  }

  private async enhancedUsecases(
    usecases: Awaited<ReturnType<typeof this.getUsecases>>
  ) {
    const progress = await getUseCaseProgress(this.cp_id);
    return usecases.map((usecase) => {
      return {
        ...usecase,
        completion: getSingleUseCaseCompletion({
          progress,
          usecase_id: usecase.id,
        }),
      };
    });
  }

  private formatUsecases(
    usecases: Awaited<ReturnType<typeof this.enhancedUsecases>>
  ) {
    return usecases.map((usecase) => {
      return {
        id: usecase.id,
        title: {
          full: usecase.title,
          simple: usecase.simple ? usecase.simple : undefined,
          prefix: usecase.prefix ? usecase.prefix : undefined,
          info: usecase.info ? usecase.info : undefined,
        },
        completion: usecase.completion,
      };
    });
  }
}
