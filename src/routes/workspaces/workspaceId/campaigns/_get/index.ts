/** OPENAPI-ROUTE: get-workspace-campaigns */
import { Context } from "openapi-backend";
import * as db from "../../../../../features/db";
import getWorkspace from "@src/routes/workspaces/workspaceId/getWorkspace";
import getUserProjects from "../../getUserProjects";
import {
  paginateItems,
  formatCount,
  getCampaignStatus,
} from "@src/routes/shared";
import {
  ERROR_MESSAGE,
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
} from "@src/routes/shared";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;
  res.status_code = 200;

  let error = {
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  try {
    let wid = parseInt(c.request.params.wid as string);

    let limit = c.request.query.limit
      ? parseInt(c.request.query.limit as string)
      : (LIMIT_QUERY_PARAM_DEFAULT as StoplightComponents["parameters"]["limit"]);
    let start = c.request.query.start
      ? parseInt(c.request.query.start as string)
      : (START_QUERY_PARAM_DEFAULT as StoplightComponents["parameters"]["start"]);

    let order;
    if (typeof c.request.query.order === "string")
      order = c.request.query
        .order as StoplightOperations["get-workspace-campaigns"]["parameters"]["query"]["order"];

    if (order && order !== "ASC" && order !== "DESC") {
      res.status_code = 400;
      error.code = 400;
      return error;
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
      error.code = 400;
      return error;
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
        error.code = 400;
        return error;
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

    await getWorkspace(wid, user);

    let userProjects = await getUserProjects(wid, user);

    if (!userProjects.length) {
      return await paginateItems({ items: [], total: 0 });
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
        c.status_id,
        c.is_public,
        c.campaign_type_id,
        c.project_id,
        c.customer_id,
        ct.name AS campaign_type_name,
        ct.type AS campaign_family_id,
        p.display_name 
      FROM wp_appq_evd_campaign c 
      JOIN wp_appq_project p ON c.project_id = p.id 
      LEFT JOIN wp_appq_campaign_type ct ON c.campaign_type_id = ct.id 
      WHERE p.id IN (${userProjectsID})
      ${AND}
      ${order && orderBy ? ` ORDER BY ${orderBy} ${order}` : ``}
      ${limit ? ` LIMIT ${limit} OFFSET ${start}` : ``}
    `;

    const campaigns = await db.query(query);

    const countQuery = `SELECT COUNT(*) FROM wp_appq_evd_campaign c JOIN wp_appq_project p ON c.project_id = p.id WHERE p.id IN (${userProjectsID})`;
    let total = await db.query(countQuery);
    total = formatCount(total);

    if (!campaigns.length) return await paginateItems({ items: [], total: 0 });

    let stoplightCampaign = campaigns.map((campaign: any) => {
      // Get campaign family
      let campaign_family = "";
      switch (campaign.campaign_family_id) {
        case 0:
          campaign_family = "Experiential";
          break;
        case 1:
          campaign_family = "Functional";
          break;
      }

      return {
        id: campaign.id,
        start_date: campaign.start_date.toString(),
        end_date: campaign.end_date.toString(),
        close_date: campaign.close_date.toString(),
        title: campaign.title,
        customer_title: campaign.customer_title,
        status_id: campaign.status_id,
        status_name: getCampaignStatus(campaign),
        is_public: campaign.is_public,
        campaign_type_id: campaign.campaign_type_id,
        campaign_type_name: campaign.campaign_type_name || "Crowd Test",
        campaign_family_id: campaign.campaign_family_id,
        campaign_family_name: campaign_family,
        project_id: campaign.project_id,
        customer_id: campaign.customer_id,
        project_name: campaign.display_name,
      };
    });
    return await paginateItems({
      items: stoplightCampaign,
      limit,
      start,
      total,
    });
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
