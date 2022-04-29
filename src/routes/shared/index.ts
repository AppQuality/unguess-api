import { getCampaignStatus } from "./getCampaignStatus";
import paginateItems, { formatCount } from "./paginateItems";

export const ERROR_MESSAGE = "Something went wrong";
export const LIMIT_QUERY_PARAM_DEFAULT = 10;
export const START_QUERY_PARAM_DEFAULT = 0;

export interface ResponseError {
  message: string;
  code: number;
  error: boolean;
}

export const fallBackCsmProfile: StoplightComponents["schemas"]["Workspace"]["csm"] =
  {
    id: 20739,
    name: "Gianluca Peretti",
    email: "gianluca.peretti@unguess.io",
    tryber_wp_user_id: 21605,
    profile_id: 20739,
  };

export { getCampaignStatus, formatCount, paginateItems };
