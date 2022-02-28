import { Context } from 'openapi-backend';

export default async (c : Context, req : Request, res : OpenapiResponse) => {
  res.skip_post_response_handler = true;
  return res.status(404).json({
    err: "not found",
  });
};
