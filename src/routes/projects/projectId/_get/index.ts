/** OPENAPI-CLASS: get-projects-projectId */
import { Context } from "openapi-backend";
import { getProjectById } from "@src/utils/projects";
import { ERROR_MESSAGE } from "@src/utils/constants";
import ProjectRoute from "@src/features/routes/ProjectRoute";

// export default async (
//   c: Context,
//   req: OpenapiRequest,
//   res: OpenapiResponse
// ) => {
//   let user = req.user;
//   let error = {
//     message: ERROR_MESSAGE,
//     error: true,
//   } as StoplightComponents["schemas"]["Error"];
//   res.status_code = 200;

//   let pid = parseInt(c.request.params.pid as string);

//   try {
//     return await getProjectById({
//       user: user,
//       projectId: pid,
//     });
//   } catch (e: any) {
//     if (e.code) {
//       error.code = e.code;
//       res.status_code = e.code;
//     } else {
//       error.code = 500;
//       res.status_code = 500;
//     }

//     return error;
//   }
// };

export default class Route extends ProjectRoute<{
  response: StoplightOperations["get-projects-projectId"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-projects-projectId"]["parameters"]["path"];
}> {
  protected async prepare(): Promise<void> {
    console.log(this.project);
    this.setSuccess(200, this.project);
  }
}
