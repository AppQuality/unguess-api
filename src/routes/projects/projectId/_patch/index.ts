/** OPENAPI-ROUTE: patch-projects-pid */
import { Context } from "openapi-backend";
import * as db from "@src/features/db";
import { getProjectById } from "@src/utils/projects";
import { ERROR_MESSAGE } from "@src/utils/constants";

const patchableFields = ["display_name"]; // Only allow these fields to be patched (for now)

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;
  let error = {
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  res.status_code = 200;

  let pid = parseInt(c.request.params.pid as string);

  try {
    const validData = Object.keys(req.body)
      .filter((key) => patchableFields.includes(key))
      .reduce((obj: { [key: string]: string }, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    if (Object.keys(validData).length) {
      const project = await getProjectById({
        user: user,
        projectId: pid,
      });

      const changes = Object.keys(validData).map((key) =>
        db.format(`${key} = ?`, [validData[key]])
      );

      const updateQuery = db.format(
        `UPDATE wp_appq_project SET ${changes.join(",")} WHERE id = ?`,
        [project.id]
      );

      await db.query(updateQuery);

      return {
        ...project,
        name: validData.display_name,
      };
    } else {
      res.status_code = 400;
      return {
        ...error,
        message: "No valid fields provided",
      };
    }

    // if (project) {
    return error;
    // }

    return { code: 123, message: "Project not found", error: true };
  } catch (e: any) {
    console.log("Catch", e);
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
