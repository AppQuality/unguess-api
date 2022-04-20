export const ERROR_MESSAGE = "Something went wrong";
export const LIMIT_QUERY_PARAM_DEFAULT = 10;
export const START_QUERY_PARAM_DEFAULT = 0;

export interface ResponseError {
  message: string;
  code: number;
  error: boolean;
}
