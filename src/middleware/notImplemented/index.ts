import OpenAPIBackend, { Context } from "openapi-backend";

export default (api: OpenAPIBackend) =>
  async (c: Context, req: Request, res: OpenapiResponse) => {
    res.skip_post_response_handler = true;
    const { status, mock } = api.mockResponseForOperation(
      c.operation.operationId || ""
    );
    return res.status(status).json(mock);
  };
