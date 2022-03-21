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

  return [
    {
      id: 1,
      start_date: "2017-07-20 00:00:00",
      end_date: "2017-07-20 00:00:00",
      close_date: "2017-07-20 00:00:00",
      title: "Campagnetta Provetta",
      description: "Descrizione della campagnazione",
      status_id: 1,
      is_public: 0,
      campaign_type_id: 1,
      project_id: 1,
      customer_title: "Campagnettina Provettina",
    },
    {
      id: 2,
      start_date: "2020-10-15 00:00:00",
      end_date: "2020-10-15 00:00:00",
      close_date: "2020-10-15 00:00:00",
      title: "Campagnona Provolona",
      description: "Descriziona della campagno",
      status_id: 1,
      is_public: 0,
      campaign_type_id: 1,
      project_id: 1,
      customer_title: "Campagnettona Provolettona",
    },
  ];
};
