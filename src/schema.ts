/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/": {
    /** Get all routes available for this apis */
    get: operations["get-root"];
    parameters: {};
  };
  "/authenticate": {
    /** A request to login with your username and password */
    post: operations["post-authenticate"];
  };
  "/users/me": {
    get: operations["get-users-me"];
  };
  "/workspaces": {
    get: operations["get-workspaces"];
  };
  "/workspaces/{wid}": {
    get: operations["get-workspace"];
    parameters: {
      path: {
        /** Workspace (company, customer) id */
        wid: components["parameters"]["wid"];
      };
    };
  };
  "/workspaces/{wid}/campaigns": {
    get: operations["get-workspace-campaigns"];
    parameters: {
      path: {
        /** Workspace (company, customer) id */
        wid: components["parameters"]["wid"];
      };
    };
  };
  "/workspaces/{wid}/projects": {
    get: operations["get-workspace-projects"];
    parameters: {
      path: {
        /** Workspace (company, customer) id */
        wid: components["parameters"]["wid"];
      };
    };
  };
  "/workspaces/{wid}/projects/{pid}": {
    get: operations["get-workspace-project"];
    parameters: {
      path: {
        /** Workspace (company, customer) id */
        wid: components["parameters"]["wid"];
        /** Project id */
        pid: components["parameters"]["pid"];
      };
    };
  };
  "/workspaces/{wid}/projects/{pid}/campaigns": {
    get: operations["get-workspace-project-campaigns"];
    parameters: {
      path: {
        /** Workspace (company, customer) id */
        wid: components["parameters"]["wid"];
        /** Project id */
        pid: components["parameters"]["pid"];
      };
    };
  };
  "/projects/{pid}/campaigns": {
    get: operations["get-project-campaigns"];
    parameters: {
      path: {
        /** Project id */
        pid: number;
      };
    };
  };
  "/projects/{pid}": {
    /** Retrieve projects details from an ID. */
    get: operations["get-projects-projectId"];
    parameters: {
      path: {
        /** Project id */
        pid: components["parameters"]["pid"];
      };
    };
  };
  "/campaigns": {
    post: operations["post-campaigns"];
  };
}

export interface components {
  schemas: {
    /** User */
    User: {
      id: number;
      /** Format: email */
      email: string;
      role: string;
      name: string;
      workspaces: components["schemas"]["Workspace"][];
      profile_id: number;
      tryber_wp_user_id: number;
      unguess_wp_user_id: number;
      picture?: string;
      features?: {
        slug?: string;
        name?: string;
      }[];
    };
    /** Authentication */
    Authentication: {
      id: number;
      /** Format: email */
      email: string;
      role: string;
      name: string;
      picture?: string;
      token: string;
      iat?: number;
      exp?: number;
    };
    /** Workspace */
    Workspace: {
      id: number;
      company: string;
      tokens: number;
      logo?: string;
      csm: {
        id: number;
        email: string;
        name: string;
        profile_id: number;
        tryber_wp_user_id: number;
        picture?: string;
      };
    };
    /** Campaign */
    Campaign: {
      id: number;
      start_date: string;
      end_date: string;
      close_date: string;
      title: string;
      customer_title: string;
      description: string;
      status_id: number;
      status_name: string;
      is_public: number;
      campaign_type_id: number;
      campaign_type_name: string;
      test_type_name: string;
      project_id: number;
      project_name: string;
    };
    /** Project */
    Project: {
      id: number;
      name: string;
      campaigns_count: number;
    };
    /** Error */
    Error: {
      message: string;
      code: number;
      error: boolean;
    };
    /** Platform Object */
    Platform: {
      id: number;
      name: string;
      /**
       * @description 0 => smartphone,
       * 1 => tablet
       * 2 => pc
       * 3 => smartwatch
       * 4 => console
       * 5 => tv
       * @enum {string}
       */
      deviceType?:
        | "smartphone"
        | "tablet"
        | "computer"
        | "smartwatch"
        | "console"
        | "tv";
    };
  };
  responses: {
    /** Example response */
    Error: {
      content: {
        "application/json": components["schemas"]["Error"];
      };
    };
  };
  parameters: {
    /** @description Workspace (company, customer) id */
    wid: number;
    /** @description Project id */
    pid: number;
    /** @description Limit pagination parameter */
    limit: number;
    /** @description Start pagination parameter */
    start: number;
    /** @description Order value (ASC, DESC) */
    order: string;
    /** @description Order by accepted field */
    orderBy: string;
    /** @description filterBy[<fieldName>]=<fieldValue> */
    filterBy: unknown;
  };
  requestBodies: {
    Credentials: {
      content: {
        "application/json": {
          username: string;
          password: string;
        };
      };
    };
    Campaign: {
      content: {
        "application/json": {
          title: string;
          description?: string;
          start_date: string;
          end_date: string;
          close_date: string;
          customer_title?: string;
          status_id?: number;
          is_public?: number;
          /**
           * @description -1: no bug form
           * 0: only bug form
           * 1: bug form with bug parade
           */
          bug_form?: number;
          campaign_type_id: number;
          test_type_id: number;
          project_id: number;
          pm_id: number;
          platforms?: components["schemas"]["Platform"][];
          /** @description Da togliere */
          page_preview_id?: number;
          /** @description Da togliere */
          page_manual_id?: number;
          /** @description Da togliere */
          customer_id?: number;
        };
      };
    };
  };
}

export interface operations {
  /** Get all routes available for this apis */
  "get-root": {
    parameters: {};
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": { [key: string]: unknown };
        };
      };
      500: components["responses"]["Error"];
    };
  };
  /** A request to login with your username and password */
  "post-authenticate": {
    parameters: {};
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["Authentication"];
        };
      };
      500: components["responses"]["Error"];
    };
    requestBody: components["requestBodies"]["Credentials"];
  };
  "get-users-me": {
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["User"];
        };
      };
      403: components["responses"]["Error"];
      500: components["responses"]["Error"];
    };
  };
  "get-workspaces": {
    parameters: {
      query: {
        /** Limit pagination parameter */
        limit?: components["parameters"]["limit"];
        /** Start pagination parameter */
        start?: components["parameters"]["start"];
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": {
            items?: components["schemas"]["Workspace"][];
            start?: number;
            limit?: number;
            size?: number;
            total?: number;
          };
        };
      };
      400: components["responses"]["Error"];
      403: components["responses"]["Error"];
      404: components["responses"]["Error"];
      500: components["responses"]["Error"];
    };
  };
  "get-workspace": {
    parameters: {
      path: {
        /** Workspace (company, customer) id */
        wid: components["parameters"]["wid"];
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["Workspace"];
        };
      };
      400: components["responses"]["Error"];
      403: components["responses"]["Error"];
      404: components["responses"]["Error"];
      500: components["responses"]["Error"];
    };
  };
  "get-workspace-campaigns": {
    parameters: {
      path: {
        /** Workspace (company, customer) id */
        wid: components["parameters"]["wid"];
      };
      query: {
        /** Limit pagination parameter */
        limit?: components["parameters"]["limit"];
        /** Start pagination parameter */
        start?: components["parameters"]["start"];
        /** Order value (ASC, DESC) */
        order?: components["parameters"]["order"];
        /** Order by accepted field */
        orderBy?: components["parameters"]["orderBy"];
        /** filterBy[<fieldName>]=<fieldValue> */
        filterBy?: components["parameters"]["filterBy"];
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": {
            items?: components["schemas"]["Campaign"][];
            start?: number;
            limit?: number;
            size?: number;
            total?: number;
          };
        };
      };
      400: components["responses"]["Error"];
      403: components["responses"]["Error"];
      404: components["responses"]["Error"];
      500: components["responses"]["Error"];
    };
  };
  "get-workspace-projects": {
    parameters: {
      path: {
        /** Workspace (company, customer) id */
        wid: components["parameters"]["wid"];
      };
      query: {
        /** Limit pagination parameter */
        limit?: components["parameters"]["limit"];
        /** Start pagination parameter */
        start?: components["parameters"]["start"];
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": {
            items?: components["schemas"]["Project"][];
            start?: number;
            limit?: number;
            size?: number;
            total?: number;
          };
        };
      };
      400: components["responses"]["Error"];
      403: components["responses"]["Error"];
      404: components["responses"]["Error"];
      500: components["responses"]["Error"];
    };
  };
  "get-workspace-project": {
    parameters: {
      path: {
        /** Workspace (company, customer) id */
        wid: components["parameters"]["wid"];
        /** Project id */
        pid: components["parameters"]["pid"];
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["Project"];
        };
      };
      400: components["responses"]["Error"];
      403: components["responses"]["Error"];
      404: components["responses"]["Error"];
      500: components["responses"]["Error"];
    };
  };
  "get-workspace-project-campaigns": {
    parameters: {
      path: {
        /** Workspace (company, customer) id */
        wid: components["parameters"]["wid"];
        /** Project id */
        pid: components["parameters"]["pid"];
      };
      query: {
        /** Limit pagination parameter */
        limit?: components["parameters"]["limit"];
        /** Start pagination parameter */
        start?: components["parameters"]["start"];
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": {
            items?: components["schemas"]["Campaign"][];
            start?: number;
            limit?: number;
            size?: number;
            total?: number;
          };
        };
      };
      400: components["responses"]["Error"];
      403: components["responses"]["Error"];
      404: components["responses"]["Error"];
      500: components["responses"]["Error"];
    };
  };
  "get-project-campaigns": {
    parameters: {
      path: {
        /** Project id */
        pid: number;
      };
      query: {
        /** Limit pagination parameter */
        limit?: components["parameters"]["limit"];
        /** Start pagination parameter */
        start?: components["parameters"]["start"];
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": {
            items?: components["schemas"]["Campaign"][];
            start?: number;
            limit?: number;
            size?: number;
            total?: number;
          };
        };
      };
      400: components["responses"]["Error"];
      /** Unauthorized */
      401: {
        content: {
          "application/json": {
            items?: components["schemas"]["Campaign"][];
            start?: number;
            limit?: number;
            size?: number;
            total?: number;
          };
        };
      };
      403: components["responses"]["Error"];
      404: components["responses"]["Error"];
      500: components["responses"]["Error"];
    };
  };
  /** Retrieve projects details from an ID. */
  "get-projects-projectId": {
    parameters: {
      path: {
        /** Project id */
        pid: components["parameters"]["pid"];
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["Project"];
        };
      };
      400: components["responses"]["Error"];
      403: components["responses"]["Error"];
      500: components["responses"]["Error"];
    };
  };
  "post-campaigns": {
    parameters: {};
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["Campaign"];
        };
      };
      400: components["responses"]["Error"];
      403: components["responses"]["Error"];
      404: components["responses"]["Error"];
      500: components["responses"]["Error"];
    };
    requestBody: components["requestBodies"]["Campaign"];
  };
}

export interface external {}
