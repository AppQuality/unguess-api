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
    /** Update fields of a specific project. Currently only the project name is editable. */
    patch: operations["patch-projects-pid"];
    parameters: {
      path: {
        /** Project id */
        pid: components["parameters"]["pid"];
      };
    };
  };
  "/campaigns": {
    post: operations["post-campaigns"];
    parameters: {};
  };
  "/campaigns/{cid}": {
    get: operations["get-campaign"];
    patch: operations["patch-campaigns"];
    parameters: {
      path: {
        /** Campaign id */
        cid: components["parameters"]["cid"];
      };
    };
  };
  "/campaigns/{cid}/reports": {
    /** Return all available report of a specific campaign */
    get: operations["get-campaigns-reports"];
    parameters: {
      path: {
        /** Campaign id */
        cid: components["parameters"]["cid"];
      };
    };
  };
  "/projects": {
    post: operations["post-projects"];
  };
  "/workspaces/{wid}/coins": {
    get: operations["get-workspaces-coins"];
    parameters: {
      path: {
        /** Workspace (company, customer) id */
        wid: components["parameters"]["wid"];
      };
    };
  };
  "/templates": {
    /** Retrieve all available use case templates */
    get: operations["get-templates"];
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
      profile_id: number;
      tryber_wp_user_id: number;
      unguess_wp_user_id: number;
      picture?: string;
      features?: components["schemas"]["Feature"][];
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
    /**
     * Workspace
     * @description A workspace is the company area with projects and campaigns
     */
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
        url?: string;
      };
      /** @description express coins */
      coins?: number;
    };
    /** Campaign */
    Campaign: {
      id: number;
      start_date: string;
      end_date: string;
      close_date: string;
      title: string;
      customer_title: string;
      is_public: number;
      /**
       * @description -1: no bug form;
       * 0: only bug form;
       * 1: bug form with bug parade';
       */
      bug_form?: number;
      type: {
        id: number;
        name: string;
      };
      family: {
        id: number;
        name: string;
      };
      status: {
        id: number;
        name: string;
      };
      project: {
        id: number;
        name: string;
      };
      description?: string;
      base_bug_internal_id?: string;
    };
    /** Campaign */
    CampaignWithOutput: {
      id: number;
      start_date: string;
      end_date: string;
      close_date: string;
      title: string;
      customer_title: string;
      is_public: number;
      /**
       * @description -1: no bug form;
       * 0: only bug form;
       * 1: bug form with bug parade';
       */
      bug_form?: number;
      type: {
        id: number;
        name: string;
      };
      family: {
        id: number;
        name: string;
      };
      status: {
        id: number;
        name: string;
      };
      project: {
        id: number;
        name: string;
      };
      description?: string;
      base_bug_internal_id?: string;
      outputs?: components["schemas"]["Output"][];
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
      /** @description os */
      id: number;
      /**
       * @description form_factor
       *
       * 0 => smartphone,
       * 1 => tablet
       * 2 => pc
       * 3 => smartwatch
       * 4 => console
       * 5 => tv
       */
      deviceType: number;
    };
    /**
     * Feature
     * @description Flags used to enable functionality to some users
     */
    Feature: {
      slug?: string;
      name?: string;
    };
    /**
     * Coin
     * @description A coin package is a set of coins (free or paid).
     * The coin only valid currency in order to run an express campaign (no matter what type of express)
     */
    Coin: {
      id: number;
      customer_id: number;
      /** @description Number of available coin */
      amount: number;
      agreement_id?: number;
      /**
       * Format: float
       * @description This is the single coin price
       * @default 0
       */
      price?: number;
      created_on?: string;
      /** @description On each coin use, the related package will be updated */
      updated_on?: string;
    };
    /**
     * Template
     * @description Template of a usecase object
     */
    Template: {
      title: string;
      /** @description Short description used as preview of template or in templates dropdown */
      description?: string;
      /** @description HTML content used to pre-fill the use case editor */
      content?: string;
      category?: components["schemas"]["TemplateCategory"];
      /** @enum {string} */
      device_type?: "webapp" | "mobileapp";
      /**
       * @default en
       * @enum {string}
       */
      locale?: "en" | "it";
      /** Format: uri */
      image?: string;
      /**
       * @description The use case created by this template needs a login or not?
       * @default false
       */
      requiresLogin?: boolean;
    };
    /**
     * TemplateCategory
     * @description Group different templates
     */
    TemplateCategory: {
      id?: number;
      name: string;
    };
    /** UseCase */
    UseCase: {
      title: string;
      description: string;
      /** @description Optional in experiential campaigns */
      functionality?: {
        id?: number;
      } & components["schemas"]["Template"];
      logged?: boolean;
      link?: string;
    };
    /** Report */
    Report: {
      id?: number;
      title?: string;
      description?: string;
      url: string;
      file_type?: {
        extension?: components["schemas"]["ReportExtensions"];
        type: string;
        domain_name?: string;
      };
      creation_date?: string;
      update_date?: string;
    };
    /**
     * ReportExtensions
     * @enum {string}
     */
    ReportExtensions:
      | "pdf"
      | "doc"
      | "docx"
      | "xls"
      | "xlsx"
      | "ppt"
      | "pptx"
      | "rar"
      | "txt"
      | "csv"
      | "zip"
      | "gzip"
      | "gz"
      | "7z";
    /**
     * Output
     * @description campaign output item
     * @enum {string}
     */
    Output: "bugs" | "media";
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
    /** @description Campaign id */
    cid: number;
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
          start_date: string;
          end_date: string;
          close_date: string;
          customer_title?: string;
          status_id?: number;
          is_public?: number;
          campaign_type_id: number;
          project_id: number;
          pm_id: number;
          platforms: components["schemas"]["Platform"][];
          /** @description Da togliere */
          page_preview_id?: number;
          /** @description Da togliere */
          page_manual_id?: number;
          /** @description Used to check available coins */
          customer_id: number;
          has_bug_form?: number;
          /** @description if has_bug_form is 0 this has to be 0 */
          has_bug_parade?: number;
          /** @description Useless value required by Tryber BackOffice */
          description?: string;
          base_bug_internal_id?: string;
          express_slug: string;
          use_cases?: components["schemas"]["UseCase"][];
        };
      };
    };
    Project: {
      content: {
        "application/json": {
          name: string;
          customer_id: number;
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
        /** Order value (ASC, DESC) */
        order?: components["parameters"]["order"];
        /** Order by accepted field */
        orderBy?: components["parameters"]["orderBy"];
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
            items?: components["schemas"]["CampaignWithOutput"][];
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
            items?: components["schemas"]["CampaignWithOutput"][];
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
            items?: components["schemas"]["CampaignWithOutput"][];
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
      401: components["responses"]["Error"];
      403: components["responses"]["Error"];
      500: components["responses"]["Error"];
    };
  };
  /** Update fields of a specific project. Currently only the project name is editable. */
  "patch-projects-pid": {
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
      401: components["responses"]["Error"];
      403: components["responses"]["Error"];
      405: components["responses"]["Error"];
      500: components["responses"]["Error"];
    };
    requestBody: {
      content: {
        "application/json": {
          display_name: string;
        };
      };
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
  "get-campaign": {
    parameters: {
      path: {
        /** Campaign id */
        cid: components["parameters"]["cid"];
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["CampaignWithOutput"];
        };
      };
    };
  };
  "patch-campaigns": {
    parameters: {
      path: {
        /** Campaign id */
        cid: components["parameters"]["cid"];
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["Campaign"];
        };
      };
    };
    requestBody: {
      content: {
        "application/json": {
          customer_title?: string;
        };
      };
    };
  };
  /** Return all available report of a specific campaign */
  "get-campaigns-reports": {
    parameters: {
      path: {
        /** Campaign id */
        cid: components["parameters"]["cid"];
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": components["schemas"]["Report"][];
        };
      };
    };
  };
  "post-projects": {
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
    requestBody: components["requestBodies"]["Project"];
  };
  "get-workspaces-coins": {
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
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": {
            items?: components["schemas"]["Coin"][];
            start?: number;
            limit?: number;
            size?: number;
            total?: number;
          };
        };
      };
      400: components["responses"]["Error"];
      403: components["responses"]["Error"];
      500: components["responses"]["Error"];
    };
  };
  /** Retrieve all available use case templates */
  "get-templates": {
    parameters: {
      query: {
        /** filterBy[<fieldName>]=<fieldValue> */
        filterBy?: components["parameters"]["filterBy"];
        /** Order value (ASC, DESC) */
        order?: components["parameters"]["order"];
        /** Order by accepted field */
        orderBy?: components["parameters"]["orderBy"];
      };
    };
    responses: {
      /** OK */
      200: {
        content: {
          "application/json": ({
            id?: number;
          } & components["schemas"]["Template"])[];
        };
      };
      400: components["responses"]["Error"];
      403: components["responses"]["Error"];
      500: components["responses"]["Error"];
    };
  };
}

export interface external {}
