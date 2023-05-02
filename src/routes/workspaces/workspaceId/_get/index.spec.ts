import app from "@src/app";
import request from "supertest";
import { fallBackCsmProfile } from "@src/utils/constants";
import { useBasicWorkspaces } from "@src/features/db/hooks/basicWorkspaces";

describe("GET /workspaces/{wid}", () => {
  const context = useBasicWorkspaces();

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
        coins: 0,
      })
    );
  });
});
