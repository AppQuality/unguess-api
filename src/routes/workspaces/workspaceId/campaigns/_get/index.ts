/** OPENAPI-ROUTE: get-workspace-campaigns */
import { Context } from "openapi-backend";
import * as db from "../../../../../features/db";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;

  res.status_code = 200;

  const exampleCampaigns: any = [];
  [...Array(10).keys()].forEach((projectId) => {
    let baseId = projectId * 10;
    [...Array(10).keys()].forEach((id) => {
      let cp_id = baseId + (id + 1);
      exampleCampaigns.push({
        id: cp_id,
        start_date: "2017-07-20 00:00:00",
        end_date: "2017-07-20 00:00:00",
        close_date: "2017-07-20 00:00:00",
        title: "Campagnetta Provetta " + cp_id,
        description: "Descrizione della campagnazione",
        status_id: 1,
        is_public: 0,
        campaign_type_id: 1,
        project_id: projectId + 1,
        customer_title: "Campagnettina Provettina",
      });
    });
  });

  console.log(exampleCampaigns);

  return exampleCampaigns;
};
