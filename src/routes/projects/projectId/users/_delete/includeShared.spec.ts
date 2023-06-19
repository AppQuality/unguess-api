import app from "@src/app";
import request from "supertest";
import { tryber } from "@src/features/database";
import { useBasicProjectsContext } from "@src/features/db/hooks/basicProjects";

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

const project_987 = {
  id: 987,
  display_name: "Project 987",
  customer_id: 456,
  edited_by: 32,
};

describe("DELETE /projects/wid/users include shared", () => {
  const context = useBasicProjectsContext();

  beforeAll(async () => {
    await tryber.tables.WpAppqProject.do().insert(project_987);
    await tryber.tables.WpAppqUserToProject.do().insert({
      project_id: project_987.id,
      wp_user_id: context.profile3.wp_user_id,
    });

    await tryber.tables.WpAppqEvdCampaign.do().insert({
      ...baseCP,
      id: 1,
      project_id: project_987.id,
    });

    await tryber.tables.WpAppqEvdCampaign.do().insert({
      ...baseCP,
      id: 2,
      project_id: project_987.id,
    });

    await tryber.tables.WpAppqUserToCampaign.do().insert({
      campaign_id: 1,
      wp_user_id: context.profile3.wp_user_id,
    });

    await tryber.tables.WpAppqUserToCampaign.do().insert({
      campaign_id: 2,
      wp_user_id: context.profile3.wp_user_id,
    });
  });

  it("Should answer 200 and remove also every other shared items inside this project if required", async () => {
    const sharedCampaign = await tryber.tables.WpAppqUserToCampaign.do()
      .count({ count: "campaign_id" })
      .where({
        wp_user_id: context.profile3.wp_user_id,
      })
      .first();

    expect(sharedCampaign?.count).toBe(2);

    const response = await request(app)
      .delete(`/projects/${project_987.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        user_id: context.profile3.wp_user_id,
        include_shared: true,
      });

    expect(response.status).toBe(200);

    const sharedCampaignAfterDelete =
      await tryber.tables.WpAppqUserToCampaign.do()
        .count({ count: "campaign_id" })
        .where({
          wp_user_id: context.profile3.wp_user_id,
        })
        .first();

    expect(sharedCampaignAfterDelete?.count).toBe(0);
  });

  // --- end of tests
});
