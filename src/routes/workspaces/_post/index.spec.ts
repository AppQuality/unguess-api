import app from "@src/app";
import request from "supertest";
import { useBasicWorkspaces } from "@src/features/db/hooks/basicWorkspaces";
import { fallBackCsmProfile } from "@src/utils/constants";

describe("POST /workspaces", () => {
  const context = useBasicWorkspaces();

  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).post("/workspaces");
    expect(response.status).toBe(403);
  });

  it("Should answer 400 if body is not provided", async () => {
    const response = await request(app)
      .post("/workspaces")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should answer 400 if body is not valid", async () => {
    const response = await request(app)
      .post("/workspaces")
      .set("authorization", "Bearer admin")
      .send({
        name: "Peppino",
      });
    expect(response.status).toBe(400);
  });

  it("Should answer 403 if the user is not an admin", async () => {
    const response = await request(app)
      .post("/workspaces")
      .set("authorization", "Bearer user")
      .send({
        company: "Tesla Inc",
      });
    expect(response.status).toBe(403);
  });

  it("Should answer 200 and the company name and id if is an admin and the body is valid", async () => {
    const response = await request(app)
      .post("/workspaces")
      .set("authorization", "Bearer admin")
      .send({
        company: "Tesla Inc",
      });

    expect(response.status).toBe(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        company: "Tesla Inc",
      })
    );
  });

  it("Should answer 200 and the default csm if none is provided", async () => {
    const response = await request(app)
      .post("/workspaces")
      .set("authorization", "Bearer admin")
      .send({
        company: "Apple",
      });

    expect(response.status).toBe(200);

    const workspace = await request(app)
      .get(`/workspaces/${response.body.id}`)
      .set("authorization", "Bearer admin");

    expect(workspace.body).toEqual(
      expect.objectContaining({
        id: response.body.id,
        company: "Apple",
      })
    );

    expect(workspace.body.csm).toEqual(
      expect.objectContaining({
        id: fallBackCsmProfile.id,
        email: fallBackCsmProfile.email,
      })
    );
  });

  it("Should answer 200 and set a specific pm_id if provided", async () => {
    const response = await request(app)
      .post("/workspaces")
      .set("authorization", "Bearer admin")
      .send({
        company: "Microsoft",
        pm_id: context.profile2.id,
      });

    expect(response.status).toBe(200);

    const workspace = await request(app)
      .get(`/workspaces/${response.body.id}`)
      .set("authorization", "Bearer admin");

    expect(workspace.body).toEqual(
      expect.objectContaining({
        id: response.body.id,
        company: "Microsoft",
      })
    );

    expect(workspace.body.csm).toEqual(
      expect.objectContaining({
        id: context.profile2.id,
        email: context.profile2.email,
      })
    );
  });
});
