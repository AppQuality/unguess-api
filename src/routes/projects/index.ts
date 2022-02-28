/** OPENAPI-ROUTE: get-projects */
import * as db from "@src/features/db";
import { Context } from "openapi-backend";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  const user = req.user;
  const myParameter: StoplightOperations["get-projects"]["parameters"]["query"]["my-parameter"] =
    typeof req.query.myParameter === "string"
      ? parseInt(req.query.myParameter)
      : undefined;

  if (user.role !== "administrator") {
    res.status_code = 403;
    return {
      element: "projects",
      id: 0,
      message: "You cannot retrieve projects",
    };
  }
  try {
    const sql = `SELECT id,name,description FROM wp_projects`;
    const results = await db.query(sql);
    res.status_code = 200;
    return { items: results };
  } catch {
    res.status_code = 400;
    return {
      element: "projects",
      id: 0,
      message: "Error retrieving projects",
    };
  }
};
