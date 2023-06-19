import app from "@src/app";
import request from "supertest";
import { useBasicWorkspaces } from "@src/features/db/hooks/basicWorkspaces";
import { tryber } from "@src/features/database";

const invited_profile = {
  id: 35,
  wp_user_id: 15,
  name: "Customer Invited",
  surname: "Customer Invited",
  email: "Invited@unguess.io",
  employment_id: -1,
  education_id: -1,
};

const invited_to_customer_1 = {
  wp_user_id: invited_profile.wp_user_id,
  customer_id: 456,
};

describe("DELETE /workspaces/wid/users", () => {
  const context = useBasicWorkspaces();

  beforeAll(async () => {
    await tryber.tables.WpAppqEvdProfile.do().insert(invited_profile);
    await tryber.tables.WpAppqUserToCustomer.do().insert(invited_to_customer_1);
  });

  afterAll(async () => {
    await tryber.tables.WpAppqEvdProfile.do().delete();
    await tryber.tables.WpAppqUserToCustomer.do().delete();
  });

  // It should answer 403 if user is not logged in
  it("should answer 403 if user is not logged in", async () => {
    const response = await request(app)
      .delete(`/workspaces/${context.customer_1.id}/users`)
      .send({
        user_id: 2,
      });

    expect(response.status).toBe(403);
  });

  // It should answer 400 if no body is sent
  it("should answer 400 if no body has a wrong format", async () => {
    const response = await request(app)
      .delete(`/workspaces/${context.customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        user_id: "Alfredo",
      });
    expect(response.status).toBe(400);
  });

  it("should answer 400 if no body is sent", async () => {
    const response = await request(app)
      .delete(`/workspaces/${context.customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send();
    expect(response.status).toBe(400);
  });

  // it should add a user to the workspace
  it("should answer 400 if the user provided is not in the workspace", async () => {
    const response = await request(app)
      .delete(`/workspaces/${context.customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        user_id: 999,
      });
    expect(response.status).toBe(400);
  });

  it("should answer 200 and remove the user from workspace", async () => {
    const response = await request(app)
      .delete(`/workspaces/${context.customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        user_id: context.profile2.wp_user_id,
      });
    expect(response.status).toBe(200);

    const users = await request(app)
      .get(`/workspaces/${context.customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send();

    expect(users.body.items).toHaveLength(2);
  });

  it("Should answer 200 and remove also every other shared items inside this workspace if required", async () => {
    await tryber.tables.WpAppqUserToCustomer.do().insert({
      wp_user_id: context.profile3.wp_user_id,
      customer_id: context.customer_1.id,
    });

    await tryber.tables.WpAppqProject.do().insert([
      {
        id: 987,
        display_name: "Project 987",
        customer_id: context.customer_1.id,
        edited_by: context.profile1.wp_user_id,
      },
      {
        id: 654,
        display_name: "Project 654",
        customer_id: context.customer_1.id,
        edited_by: context.profile1.wp_user_id,
      },
    ]);

    // create campaign on project 2
    await tryber.tables.WpAppqEvdCampaign.do().insert({
      id: 1,
      start_date: "2017-07-20 10:00:00",
      end_date: "2017-07-20 10:00:00",
      close_date: "2017-07-20 10:00:00",
      title: "Campaign 2 title",
      customer_title: "Campaign 2 customer title",
      status_id: 1,
      is_public: 1,
      campaign_type_id: 1,
      campaign_type: -1,
      project_id: 654,
      platform_id: 1,
      page_preview_id: 1,
      page_manual_id: 1,
      customer_id: 456,
      pm_id: 1,
      cust_bug_vis: 1,
      base_bug_internal_id: "C-",
    });

    await tryber.tables.WpAppqUserToProject.do().insert({
      project_id: 987,
      wp_user_id: context.profile3.wp_user_id,
    });

    await tryber.tables.WpAppqUserToCampaign.do().insert({
      campaign_id: 1,
      wp_user_id: context.profile3.wp_user_id,
    });

    const response = await request(app)
      .delete(`/workspaces/${context.customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        user_id: context.profile3.wp_user_id,
        include_shared: true,
      });
    expect(response.status).toBe(200);

    const sharedProject = await tryber.tables.WpAppqUserToProject.do()
      .select()
      .where({
        project_id: 987,
        wp_user_id: context.profile3.wp_user_id,
      })
      .first();

    const sharedCampaign = await tryber.tables.WpAppqUserToCampaign.do()
      .select()
      .where({
        campaign_id: 1,
        wp_user_id: context.profile3.wp_user_id,
      })
      .first();

    expect(sharedProject).toBeUndefined();
    expect(sharedCampaign).toBeUndefined();
  });

  // --- end of tests
});
