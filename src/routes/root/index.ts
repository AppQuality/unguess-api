/**  OPENAPI-ROUTE : get-root */
import { Context } from "openapi-backend";

import getBranch from "./getBranch";
import getRevision from "./getRevision";

export default (c: Context, req: Request, res: OpenapiResponse) => {
  res.status_code = 200;
  let revision = getRevision();
  let branch = getBranch();
  return { branch, revision };
};
