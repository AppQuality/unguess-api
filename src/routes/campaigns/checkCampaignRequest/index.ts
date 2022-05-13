import { ERROR_MESSAGE, fallBackCsmProfile } from "@src/routes/shared";
import checkPlatforms from "@src/routes/campaigns/checkPlatform";

export default async (
  campaign_request: StoplightComponents["requestBodies"]["Campaign"]["content"]["application/json"]
): Promise<
  StoplightComponents["requestBodies"]["Campaign"]["content"]["application/json"]
> => {
  let error = {
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  // Check request
  if (!campaign_request) throw { ...error, code: 400 };

  // Check mandatory fields
  if (
    !campaign_request.title ||
    !campaign_request.start_date ||
    !campaign_request.end_date ||
    !campaign_request.close_date ||
    !campaign_request.campaign_type_id ||
    !campaign_request.test_type_id ||
    !campaign_request.project_id
  ) {
    throw { ...error, code: 400 };
  }

  //Check Platforms
  let platforms_result = await checkPlatforms(campaign_request.platforms);

  if (!platforms_result) throw { ...error, code: 400 };

  // Return validated request and set default values
  return {
    ...campaign_request,
    customer_title: campaign_request.customer_title || campaign_request.title,
    status_id: campaign_request.status_id || 1,
    is_public: campaign_request.is_public || 0,
    page_preview_id: campaign_request.page_preview_id || 0,
    page_manual_id: campaign_request.page_manual_id || 0,
    customer_id: campaign_request.customer_id || 0,
    pm_id: campaign_request.pm_id || fallBackCsmProfile.id,
    platforms: campaign_request.platforms || [],
  };
};
