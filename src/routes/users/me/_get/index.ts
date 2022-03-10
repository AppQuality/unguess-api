/** OPENAPI-ROUTE: get-users-me */
import { Context, Request } from "openapi-backend";

export default async (c: Context, req: Request, res: OpenapiResponse) => {
  return {
    username: "",
    email: "",
  };
};
