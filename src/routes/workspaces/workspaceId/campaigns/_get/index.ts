/** OPENAPI-ROUTE: get-workspace-campaigns */
import { Context } from "openapi-backend";
import * as db from "../../../../../features/db";
import getWorkspace from "@src/routes/workspaces/workspaceId/getWorkspace";
import getUserProjects from "../../getUserProjects";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;
  res.status_code = 200;

  try {
    let customer_id;
    if (typeof c.request.params.wid === "string")
      customer_id = parseInt(
        c.request.params.wid
      ) as StoplightOperations["get-workspace-campaigns"]["parameters"]["path"]["wid"];

    if (!customer_id || customer_id < 0) {
      res.status_code = 400;
      return "Customer not valid";
    }

    let limit;
    if (typeof c.request.query.limit === "string")
      limit = parseInt(
        c.request.query.limit
      ) as StoplightOperations["get-workspace-campaigns"]["parameters"]["query"]["limit"];

    let start;
    if (typeof c.request.query.start === "string")
      start = parseInt(
        c.request.query.start
      ) as StoplightOperations["get-workspace-campaigns"]["parameters"]["query"]["start"];

    if (
      (start && !limit) ||
      (!start && start !== 0 && limit) ||
      (start && start < 0) ||
      (limit && limit < 0)
    ) {
      res.status_code = 400;
      return "Bad request, pagination data is not valid";
    }

    let order;
    if (typeof c.request.query.order === "string")
      order = c.request.query
        .order as StoplightOperations["get-workspace-campaigns"]["parameters"]["query"]["order"];

    if (order && order !== "ASC" && order !== "DESC") {
      res.status_code = 400;
      return "Bad request, order data is not valid";
    }

    const validOrderByFields = [
      "start_date",
      "end_date",
      "close_date",
      "title",
    ];
    let orderBy;
    if (typeof c.request.query.orderBy === "string")
      orderBy = c.request.query
        .orderBy as StoplightOperations["get-workspace-campaigns"]["parameters"]["query"]["orderBy"];

    if (orderBy && !validOrderByFields.includes(orderBy)) {
      res.status_code = 400;
      return "Bad request, orderBy value not allowed";
    }

    if ((order && !orderBy) || (!order && orderBy)) {
      res.status_code = 400;
      return "Bad request, ordination data is not valid";
    }

    const validFilterByFields: { [key: string]: string } = {
      customer_title: "c.customer_title",
      title: "c.title",
      campaign_type_name: "ct.name",
      test_type_name: "ct.type",
      project_name: "p.display_name",
    };

    let filterBy = req.query.filterBy as { [key: string]: string | string[] };
    let AND = ``;

    if (filterBy) {
      let filterByQuery: string[] = [];
      let acceptedFilters = Object.keys(validFilterByFields).filter((f) =>
        Object.keys(filterBy).includes(f)
      );

      if (!acceptedFilters.length) {
        res.status_code = 400;
        return "Bad request, filter value not allowed";
      } else {
        acceptedFilters = acceptedFilters.map((k) => {
          const v = filterBy[k];
          if (typeof v === "string") {
            filterByQuery.push(`%${v}%`);
            return `${validFilterByFields[k]} LIKE ?`;
          }
          const orQuery = v
            .map((el: string) => {
              filterByQuery.push(`%${el}%`);
              return `${validFilterByFields[k]} LIKE ?`;
            })
            .join(" OR ");
          return ` ( ${orQuery} ) `;
        });
        AND = `AND ${Object.values(acceptedFilters).join(` AND `)}`;
        AND = db.format(AND, filterByQuery);
      }
    }

    await getWorkspace(customer_id, user);

    let userProjects = await getUserProjects(customer_id, user);

    if (!userProjects.length) {
      return {
        items: [],
        total: 0,
        limit: 0,
        start: 0,
        size: 0,
      };
    }

    // Return all the user projects ids
    let userProjectsID = userProjects.map((p) => p.id).join(",");

    const query = `SELECT 
        c.id,  
        c.start_date,  
        c.end_date,
        c.close_date,
        c.title,
        c.customer_title,
        c.description,
        c.status_id,
        c.is_public,
        c.campaign_type_id,
        c.project_id,
        c.customer_id,
        ct.name AS campaign_type_name,
        ct.type AS test_type_id,
        p.display_name 
      FROM wp_appq_evd_campaign c 
      JOIN wp_appq_project p ON c.project_id = p.id 
      JOIN wp_appq_campaign_type ct ON c.campaign_type_id = ct.id 
      WHERE p.project_id IN (?)
      ${AND}
      ${limit && (start || start === 0) ? `LIMIT ${limit} OFFSET ${start}` : ``}
      ${order && orderBy ? `ORDER BY ${orderBy} ${order}` : ``}
    `;

    const campaigns = await db.query(db.format(query, [userProjectsID]));

    const countQuery = `SELECT COUNT(*) FROM wp_appq_evd_campaign c WHERE c.customer_id = ?`;
    let totalSize = await db.query(db.format(countQuery, [customer_id]));
    totalSize = totalSize.map((el: any) => el["COUNT(*)"])[0];

    if (!campaigns.length)
      return {
        items: [],
        total: 0,
        limit: 0,
        start: 0,
        size: 0,
      };

    let stoplightCampaign = campaigns.map((campaign: any) => {
      return {
        id: campaign.id,
        start_date: campaign.start_date.toString(),
        end_date: campaign.end_date.toString(),
        close_date: campaign.close_date.toString(),
        title: campaign.title,
        customer_title: campaign.customer_title,
        description: campaign.description,
        status_id: campaign.status_id,
        is_public: campaign.is_public,
        campaign_type_id: campaign.campaign_type_id,
        campaign_type_name: campaign.campaign_type_name,
        test_type_name:
          campaign.test_type_id === 1 ? "Experiential" : "Functional",
        project_id: campaign.project_id,
        customer_id: campaign.customer_id,
        project_name: campaign.display_name,
      };
    });

    return {
      items: stoplightCampaign,
      limit,
      start,
      size: stoplightCampaign.length,
      total: totalSize,
    };
  } catch (e) {
    const message = (e as OpenapiError).message;
    if (message === "No workspace found") {
      res.status_code = 404;
      return message;
    }
    res.status_code = 500;
    throw e;
  }
};
