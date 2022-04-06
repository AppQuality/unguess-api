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
        /** Workspace (company) id */
        wid: number;
      };
    };
  };
  "/workspaces/{wid}/campaigns": {
    get: operations["get-workspace-campaigns"];
    parameters: {
      path: {
        /** Workspace (company) id */
        wid: number;
      };
    };
  };
  "/workspaces/{wid}/projects": {
    get: operations["get-workspace-projects"];
    parameters: {
      path: {
        /** Workspace (company) id */
        wid: number;
      };
    };
  };
  "/workspaces/{wid}/projects/{pid}": {
    get: operations["get-workspace-project"];
    parameters: {
      path: {
        /** Workspace (company) id */
        wid: number;
        /** Project id */
        pid: number;
      };
    };
  };
  "/workspaces/{wid}/projects/{pid}/campaigns": {
    get: operations["get-workspace-project-campaigns"];
    parameters: {
      path: {
        /** Workspace (company) id */
        wid: number;
        /** Project id */
        pid: number;
      };
    };
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
      profile_id?: number;
      tryber_wp_user_id?: number;
    };
    /** Workspace */
    Workspace: {
      id: number;
      company: string;
      tokens: number;
      logo?: string;
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
  };
  responses: {
    /** Authentication data. The token can be used to authenticate the protected requests */
    Authentication: {
      content: {
        "application/json": {
          id?: number;
          firstName?: string;
          lastName?: string;
          token?: string;
          username?: string;
        };
      };
    };
    /** An error due to the resource not existing */
    NotFound: {
      content: {
        "application/json": {
          element: string;
          id: number;
          message: string;
        };
      };
    };
    /** An error due to missing required parameters */
    MissingParameters: {
      content: {
        "application/json": {
          message: string;
        };
      };
    };
    /** An error due to insufficient authorization to access the resource */
    NotAuthorized: {
      content: {
        "application/json": {
          message?: string;
        };
      };
    };
  };
  parameters: {
    /** @description A campaign id */
    campaign: string;
    /** @description A task id */
    task: string;
    /** @description A customer id */
    customer: string;
    /** @description A project id */
    project: string;
    /** @description Max items to retrieve */
    limit: number;
    /** @description Items to skip for pagination */
    start: number;
    /** @description Key-value Array for item filtering */
    filterBy: { [key: string]: unknown };
    /** @description How to order values (ASC, DESC) */
    order: "ASC" | "DESC";
    /** @description How to localize values */
    locale: "en" | "it";
    /** @description A comma separated list of fields which will be searched */
    searchBy: string;
    /** @description The value to search for */
    search: string;
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
    };
  };
  /** A request to login with your username and password */
  "post-authenticate": {
    parameters: {};
    responses: {
      200: components["responses"]["Authentication"];
      /** Unauthorized */
      401: {
        content: {
          "application/json": string;
        };
      };
    };
    /** A JSON containing username and password */
    requestBody: {
      content: {
        "application/json": {
          username: string;
          password: string;
        };
      };
    };
  };
  "get-users-me": {
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["User"];
        };
      };
      403: components["responses"]["NotAuthorized"];
      404: components["responses"]["NotFound"];
    };
  };
  "get-workspaces": {
    parameters: {};
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["Workspace"][];
        };
      };
    };
  };
  "get-workspace": {
    parameters: {
      path: {
        /** Workspace (company) id */
        wid: number;
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["Workspace"];
        };
      };
    };
  };
  "get-workspace-campaigns": {
    parameters: {
      path: {
        /** Workspace (company) id */
        wid: number;
      };
      query: {
        /** Max items to retrieve */
        limit?: components["parameters"]["limit"];
        /** Items to skip for pagination */
        start?: components["parameters"]["start"];
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": {
            items: components["schemas"]["Campaign"][];
            total: number;
            start?: number;
            size?: number;
            limit?: number;
          };
          "application/xml": { [key: string]: unknown };
        };
      };
    };
  };
  "get-workspace-projects": {
    parameters: {
      path: {
        /** Workspace (company) id */
        wid: number;
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["Project"][];
        };
      };
    };
  };
  "get-workspace-project": {
    parameters: {
      path: {
        /** Workspace (company) id */
        wid: number;
        /** Project id */
        pid: number;
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["Project"];
        };
      };
    };
  };
  "get-workspace-project-campaigns": {
    parameters: {
      path: {
        /** Workspace (company) id */
        wid: number;
        /** Project id */
        pid: number;
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["Campaign"][];
        };
      };
    };
  };
}

export interface external {}
