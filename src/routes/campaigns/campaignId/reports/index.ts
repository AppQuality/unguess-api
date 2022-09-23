/** OPENAPI-ROUTE: get-campaigns-reports */
import { Context } from "openapi-backend";
import * as db from "@src/features/db";
import { ERROR_MESSAGE } from "@src/utils/constants";
import { getCampaignReports } from "@src/utils/campaigns";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;
  let error = {
    code: 500,
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  let cid = parseInt(c.request.params.cid as string);

  res.status_code = 200;

  try {
    // Get the campaign reports
    const reports = await getCampaignReports(cid);

    return reports as StoplightComponents["schemas"]["Report"][];
  } catch (e: any) {
    if (e.code) {
      error.code = e.code;
      res.status_code = e.code;
    } else {
      error.code = 500;
      res.status_code = 500;
    }

    return error;
  }
};
