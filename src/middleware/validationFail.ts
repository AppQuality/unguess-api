import { Context } from 'openapi-backend';

export default (c : Context, req : Request, res : OpenapiResponse) => {
  res.skip_post_response_handler = true;
  return res.status(400).json({
    err: c.validation.errors,
  });
};
