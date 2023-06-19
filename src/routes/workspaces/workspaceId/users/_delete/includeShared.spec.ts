import app from "@src/app";
import request from "supertest";
import { tryber } from "@src/features/database";
import { useBasicWorkspaces } from "@src/features/db/hooks/basicWorkspaces";

const baseCP = {
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 2 title",
  customer_title: "Campaign 2 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: 1,
  campaign_type: -1,
  platform_id: 1,
  page_preview_id: 1,
  page_manual_id: 1,
  customer_id: 456,
  pm_id: 1,
  cust_bug_vis: 1,
  base_bug_internal_id: "C-",
};

describe("DELETE /workspaces/wid/users include shared", () => {
  const context = useBasicWorkspaces();

  beforeAll(async () => {
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

    await tryber.tables.WpAppqEvdCampaign.do().insert({
      ...baseCP,
      id: 111,
      project_id: 654,
    });

    await tryber.tables.WpAppqUserToProject.do().insert({
      project_id: 987,
      wp_user_id: context.profile3.wp_user_id,
    });

    await tryber.tables.WpAppqUserToCampaign.do().insert({
      campaign_id: 111,
      wp_user_id: context.profile3.wp_user_id,
    });
  });

  it("Should answer 200 and remove also every other shared items inside this project if required", async () => {
    const response = await request(app)
      .delete(`/workspaces/${context.customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        user_id: context.profile3.wp_user_id,
        include_shared: true,
      });

    expect(response.status).toBe(200);

    const sharedProject = await tryber.tables.WpAppqUserToProject.do()
      .count({ count: "project_id" })
      .where({
        project_id: 987,
        wp_user_id: context.profile3.wp_user_id,
      })
      .first();

    const sharedCampaign = await tryber.tables.WpAppqUserToCampaign.do()
      .count({ count: "campaign_id" })
      .where({
        campaign_id: 111,
        wp_user_id: context.profile3.wp_user_id,
      })
      .first();

    expect(sharedProject?.count).toBe(0);
    expect(sharedCampaign?.count).toBe(0);
  });

  // --- end of tests
});
