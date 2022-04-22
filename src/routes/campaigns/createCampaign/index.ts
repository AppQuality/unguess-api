import { ERROR_MESSAGE } from "@src/routes/shared";

export default async (
  campaign_request: StoplightComponents["requestBodies"]["Campaign"]["content"]["application/json"]
): Promise<StoplightComponents["schemas"]["Campaign"]> => {
  let error = {
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];
};
