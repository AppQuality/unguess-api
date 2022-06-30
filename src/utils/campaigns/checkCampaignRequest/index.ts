import {
  DEFAULT_BASE_BUG_INTERNAL_ID,
  ERROR_MESSAGE,
  fallBackCsmProfile,
} from "@src/utils/constants";
import { checkPlatforms } from "../checkPlatforms";
import { getCampaignType } from "../getCampaignType";

const getInternalIdFromTitle = (title: string) => {
  if (typeof title != "string" || !title) {
    return DEFAULT_BASE_BUG_INTERNAL_ID;
  }

  const acronym = title
    .match(/[\p{Alpha}\p{Nd}]+/gu)
    ?.reduce(
      (previous, next) =>
        previous +
        (+next === 0 || parseInt(next) ? parseInt(next) : next[0] || ""),
      ""
    )
    .toUpperCase();

  // Return internal id (max 10 characters)
  return acronym?.substring(0, 10) || DEFAULT_BASE_BUG_INTERNAL_ID;
};

export const checkCampaignRequest = async (
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
    !campaign_request.project_id ||
    !campaign_request.customer_id
  ) {
    throw { ...error, code: 400 };
  }

  // Check Platforms
  let platforms_result = await checkPlatforms(campaign_request.platforms);

  if (!platforms_result) throw { ...error, code: 400 };

  // Check bug form
  if (
    typeof campaign_request.has_bug_form !== undefined &&
    typeof campaign_request.has_bug_parade !== undefined
  ) {
    let bug_form_result = await getCampaignType({
      has_bug_form: campaign_request.has_bug_form,
      has_bug_parade: campaign_request.has_bug_parade,
    });

    if (bug_form_result === false) throw { ...error, code: 400 };
  }

  // Add default description
  if (!campaign_request.description)
    campaign_request.description =
      "Campaign automatically created by express wizard";

  // Add internal bug id
  if (!campaign_request.base_bug_internal_id)
    campaign_request.base_bug_internal_id = getInternalIdFromTitle(
      campaign_request.title
    );

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
