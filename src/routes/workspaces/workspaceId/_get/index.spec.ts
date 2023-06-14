import app from "@src/app";
import request from "supertest";
import { fallBackCsmProfile } from "@src/utils/constants";
import { useBasicWorkspaces } from "@src/features/db/hooks/basicWorkspaces";
import { tryber, unguess } from "@src/features/database";

describe("GET /workspaces/{wid}", () => {
  const context = useBasicWorkspaces();

  beforeAll(async () => {
    await unguess.tables.WpUgCoins.do().insert({
      customer_id: context.customer_1.id,
      amount: 123,
    });
  });

  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).get(
      `/workspaces/${context.customer_1.id}`
    );
    expect(response.status).toBe(403);
  });

  it("Should answer 200 if logged in", async () => {
    const response = await request(app)
      .get(`/workspaces/${context.customer_1.id}`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should answer 403 if no workspaces are found", async () => {
    const response = await request(app)
      .get("/workspaces/99999")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  it("Should answer 400 of the requested parameter is wrong", async () => {
    const response = await request(app)
      .get("/workspaces/banana")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should answer with a workspace object", async () => {
    const response = await request(app)
      .get(`/workspaces/${context.customer_2.id}`)
      .set("authorization", "Bearer admin");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: context.customer_2.id,
        company: context.customer_2.company,
        tokens: context.customer_2.tokens,
        logo: context.customer_2.company_logo,
        csm: fallBackCsmProfile,
      })
    );
  });

  it("Should answer with a coins info if there are some", async () => {
    const response = await request(app)
      .get(`/workspaces/${context.customer_1.id}`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(JSON.stringify(response.body)).toBe(
      JSON.stringify({
        id: context.customer_1.id,
        company: context.customer_1.company,
        tokens: context.customer_1.tokens,
        logo: context.customer_1.company_logo,
        csm: fallBackCsmProfile,
        coins: 123,
      })
    );
  });

  it("Should return 200 and a Workspace if the user is not a member BUT has access to some child item of the workspace", async () => {
    await tryber.tables.WpAppqCustomer.do().insert({
      ...context.customer_1,
      id: 1234,
    });

    await tryber.tables.WpAppqProject.do().insert({
      id: 567,
      display_name: "Progettino uno",
      customer_id: 1234,
      edited_by: 32,
    });

    await tryber.tables.WpAppqUserToProject.do().insert({
      wp_user_id: 1,
      project_id: 567,
    });

    const response = await request(app)
      .get(`/workspaces/1234`)
      .set("authorization", "Bearer user");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: 1234,
        company: context.customer_1.company,
        tokens: context.customer_1.tokens,
        logo: context.customer_1.company_logo,
        csm: fallBackCsmProfile,
      })
    );

    expect(response.body.isShared).toBe(true);
    expect(response.body.sharedItems).toBe(1);
  });

  // End of describe block
});
