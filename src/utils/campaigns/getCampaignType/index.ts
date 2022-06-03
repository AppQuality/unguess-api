export const getCampaignType = async (
  has_bug_form: StoplightComponents["requestBodies"]["Campaign"]["content"]["application/json"]["has_bug_form"],
  has_bug_parade: StoplightComponents["requestBodies"]["Campaign"]["content"]["application/json"]["has_bug_parade"]
): Promise<false | number> => {
  // Check request
  if (!has_bug_form && has_bug_parade) return false;

  if (!has_bug_form) return -1;

  if (has_bug_form && !has_bug_parade) return 0;

  if (has_bug_form && has_bug_parade) return 1;

  return false;
};
