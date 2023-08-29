import app from "@src/app";
import request from "supertest";
import {
  fallBackCsmProfile,
  FUNCTIONAL_CAMPAIGN_TYPE_ID,
  LIMIT_QUERY_PARAM_DEFAULT,
} from "@src/utils/constants";
import useCustomersDataCsmDefault from "./useCustomersDataCsmDefault";
import useCustomersDataCsmCustom from "./useCustomersDataCsmCustom";
import { tryber } from "@src/features/database";

describe("GET /workspaces", () => {
  useCustomersDataCsmDefault();

  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).get("/workspaces");
    expect(response.status).toBe(403);
  });

  it("Should answer 200 if logged in", async () => {
    const response = await request(app)
      .get("/workspaces")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should answer with an array of workspaces", async () => {
    const response = await request(app)
      .get("/workspaces")
      .set("authorization", "Bearer user");

    expect(response.body.start).toBe(0);
    expect(response.body.limit).toBe(LIMIT_QUERY_PARAM_DEFAULT);
    expect(response.body.size).toBe(2);
    expect(response.body.total).toBe(2);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          company: "Company",
          logo: "logo.png",
          tokens: 100,
          csm: fallBackCsmProfile,
        }),
        expect.objectContaining({
          id: 2,
          company: "Different Company",
          logo: "logo.png",
          tokens: 100,
          csm: fallBackCsmProfile,
        }),
      ])
    );
  });

  it("Should answer with a paginated items of workspaces", async () => {
    const response = await request(app)
      .get("/workspaces?limit=1&start=0")
      .set("authorization", "Bearer user");
    expect(response.body.start).toBe(0);
    expect(response.body.limit).toBe(1);
    expect(response.body.size).toBe(1);
    expect(response.body.total).toBe(2);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          company: "Company",
          logo: "logo.png",
          tokens: 100,
          csm: fallBackCsmProfile,
        }),
      ])
    );
  });

  // Should return an error if the limit is not a number
  it("Should answer with an error if the limit is not a number", async () => {
    const response = await request(app)
      .get("/workspaces?limit=banana&start=0")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(400);
    expect(response.body.err[0].message).toBe("should be number");
  });

  it("Should answer with an array of workspaces ordered by name DESC", async () => {
    const response = await request(app)
      .get("/workspaces?orderBy=company&order=desc")
      .set("authorization", "Bearer user");
    expect(response.body.start).toBe(0);
    expect(response.body.limit).toBe(LIMIT_QUERY_PARAM_DEFAULT);
    expect(response.body.size).toBe(2);
    expect(response.body.total).toBe(2);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 2,
          company: "Different Company",
          logo: "logo.png",
          tokens: 100,
          csm: fallBackCsmProfile,
        }),
        expect.objectContaining({
          id: 1,
          company: "Company",
          logo: "logo.png",
          tokens: 100,
          csm: fallBackCsmProfile,
        }),
      ])
    );
  });

  describe("GET /workspaces include shared items", () => {
    const campaign_type_1 = {
      id: 999,
      name: "Functional Testing (Bug Hunting)",
      type: FUNCTIONAL_CAMPAIGN_TYPE_ID,
    };

    const baseWorkspace = {
      company_logo: "logo.png",
      tokens: 100,
      pm_id: 0,
    };

    const baseProject = {
      display_name: "Progettino",
      edited_by: 32,
    };

    const baseCampaign = {
      start_date: "2017-07-20 10:00:00",
      end_date: "2017-07-20 10:00:00",
      close_date: "2017-07-20 10:00:00",
      title: "Campaign 2 title",
      customer_title: "Campaign 2 customer title",
      status_id: 1,
      is_public: 1,
      campaign_type_id: campaign_type_1.id,
      campaign_type: -1,

      platform_id: 1,
      page_preview_id: -1,
      page_manual_id: -1,
      customer_id: -1,
      pm_id: -1,
      description: "Campaign description",
    };

    beforeAll(async () => {
      await tryber.tables.WpAppqCustomer.do().insert([
        {
          ...baseWorkspace,
          id: 301,
          company: "Company with shared projects",
        },
        {
          ...baseWorkspace,
          id: 302,
          company: "Company with shared campaigns",
        },
        {
          ...baseWorkspace,
          id: 303,
          company: "Company with shared projects and campaigns",
        },
      ]);

      await tryber.tables.WpAppqProject.do().insert([
        {
          ...baseProject,
          id: 201,
          customer_id: 301,
        },
        {
          ...baseProject,
          id: 202,
          customer_id: 302,
        },
        {
          ...baseProject,
          id: 203,
          customer_id: 303,
        },
      ]);

      await tryber.tables.WpAppqEvdCampaign.do().insert([
        {
          ...baseCampaign,
          id: 102,
          project_id: 202,
        },
        {
          ...baseCampaign,
          id: 103,
          project_id: 203,
        },
      ]);

      await tryber.tables.WpAppqUserToProject.do().insert([
        {
          wp_user_id: 1,
          project_id: 201,
        },
        {
          wp_user_id: 1,
          project_id: 203,
        },
      ]);

      await tryber.tables.WpAppqUserToCampaign.do().insert([
        {
          wp_user_id: 1,
          campaign_id: 102,
        },
        {
          wp_user_id: 1,
          campaign_id: 103,
        },
      ]);
    });

    it("Should return falsy isShared and sharedItems 0 if the user is a workspace member", async () => {
      const response = await request(app)
        .get("/workspaces")
        .set("authorization", "Bearer user");

      expect(response.status).toBe(200);

      expect(response.body.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            company: "Company",
            isShared: false,
            sharedItems: 0,
          }),
        ])
      );
    });

    it("Should include also the workspaces with some shared projects inside", async () => {
      const response = await request(app)
        .get("/workspaces")
        .set("authorization", "Bearer user");

      expect(response.status).toBe(200);
      expect(response.body.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 301,
            company: "Company with shared projects",
            isShared: true,
            sharedItems: 1,
          }),
        ])
      );
    });

    it("Should include also the workspace with some shared campaigns inside", async () => {
      const response = await request(app)
        .get("/workspaces")
        .set("authorization", "Bearer user");

      expect(response.status).toBe(200);
      expect(response.body.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 302,
            company: "Company with shared campaigns",
            isShared: true,
            sharedItems: 1,
          }),
        ])
      );
    });

    it("Should include also the workspace with some shared projects and campaigns inside", async () => {
      const response = await request(app)
        .get("/workspaces")
        .set("authorization", "Bearer user");

      expect(response.status).toBe(200);
      expect(response.body.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 303,
            company: "Company with shared projects and campaigns",
            isShared: true,
            sharedItems: 2,
          }),
        ])
      );
    });

    it("Should return falsy isShared and sharedItems 0 if the user is a workspace member and has also shared item", async () => {
      await tryber.tables.WpAppqProject.do().insert({
        ...baseProject,
        id: 204,
        customer_id: 1,
      });

      await tryber.tables.WpAppqUserToProject.do().insert({
        wp_user_id: 1,
        project_id: 204,
      });

      const response = await request(app)
        .get("/workspaces")
        .set("authorization", "Bearer user");

      expect(response.status).toBe(200);
      expect(response.body.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            company: "Company",
            isShared: false,
            sharedItems: 0,
          }),
        ])
      );

      await tryber.tables.WpAppqUserToProject.do().delete().where({
        wp_user_id: 1,
        project_id: 204,
      });
    });

    it("Should return workspaces with shared items even if the users isn't a member of any workspaces", async () => {
      await tryber.tables.WpAppqUserToCustomer.do().delete().where({
        wp_user_id: 1,
      });

      const response = await request(app)
        .get("/workspaces")
        .set("authorization", "Bearer user");

      expect(response.status).toBe(200);
      expect(response.body.items.length).toEqual(3);
    });

    it("Should return also workspaces even without any user", async () => {
      await tryber.tables.WpAppqCustomer.do().insert({
        ...baseWorkspace,
        id: 500,
        company: "Workspace without users",
      });

      const response = await request(app)
        .get("/workspaces")
        .set("authorization", "Bearer admin");

      expect(response.status).toBe(200);
      expect(response.body.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 500,
          }),
        ])
      );
    });

    // end of describe GET /workspaces include shared items
  });

  // end of describe GET /workspaces
});

//DESCRIBE USE NOT FALLBACK CSM PROFILE

describe("GET /workspaces with CSM", () => {
  useCustomersDataCsmCustom();

  it("Should answer 200 if logged in", async () => {
    const response = await request(app)
      .get("/workspaces")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body.start).toBe(0);
    expect(response.body.limit).toBe(LIMIT_QUERY_PARAM_DEFAULT);
    expect(response.body.size).toBe(2);
    expect(response.body.total).toBe(2);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          company: "Company",
          logo: "logo.png",
          tokens: 100,
          csm: {
            id: 1,
            email: "marco.giuliani@unguess.io",
            name: "Marco Giuliani",
            profile_id: 1,
            tryber_wp_user_id: 1,
            url: "https://meetings.hubspot.com/marco.giuliani",
          },
        }),
        expect.objectContaining({
          id: 2,
          company: "Different Company",
          logo: "logo.png",
          tokens: 100,
          csm: {
            id: 1,
            email: "marco.giuliani@unguess.io",
            name: "Marco Giuliani",
            profile_id: 1,
            tryber_wp_user_id: 1,
            url: "https://meetings.hubspot.com/marco.giuliani",
          },
        }),
      ])
    );
  });

  // end of describe GET /workspaces with CSM
});
