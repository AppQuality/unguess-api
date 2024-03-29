export const ERROR_MESSAGE = "Something went wrong";
export const LIMIT_QUERY_PARAM_DEFAULT = 0;
export const START_QUERY_PARAM_DEFAULT = 0;
export const DT_SMARTPHONE = 0;
export const DT_TABLET = 1;
export const DT_DESKTOP = 2;
export const DT_SMARTWATCH = 3;
export const DT_CONSOLE = 4;
export const DT_TV = 5;
export const FUNCTIONAL_CAMPAIGN_TYPE_ID = 0;
export const EXPERIENTIAL_CAMPAIGN_TYPE_ID = 1;
export const DEFAULT_BUG_PRIORITY: StoplightComponents["schemas"]["BugPriority"] =
  {
    id: 3,
    name: "medium",
  };
export const DEFAULT_BUG_CUSTOM_STATUS: StoplightComponents["schemas"]["BugCustomStatus"] =
  {
    id: 1,
    name: "to do",
    phase: {
      id: 1,
      name: "working",
    },
    color: "ffffff",
    is_default: 1,
  };

/******* Related to Ordering *******/
export const DEFAULT_ORDER_BY_PARAMETER = "id";
export const SEVERITY__ID = "severity_id";
export const PRIORITY__ID = "priority_id";
export const DESC = "DESC";
export const ASC = "ASC";
export const DEFAULT_ORDER_PARAMETER = "DESC";
/* *********************************** */

export const DEFAULT_EXPRESS_COST = 1;

export const DEFAULT_BASE_BUG_INTERNAL_ID = "EXP";

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
    url: "https://meetings.hubspot.com/gianluca-peretti",
  };
