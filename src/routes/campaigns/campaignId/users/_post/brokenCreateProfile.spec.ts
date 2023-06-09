import app from "@src/app";
import request from "supertest";
import { useBasicWorkspaces } from "@src/features/db/hooks/basicWorkspaces";
import { tryber } from "@src/features/database";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";

jest.mock(
  "@src/features/wp/createUserProfile",
  () => new Error("Error creating User Profile")
);

const campaign_type_1 = {
  id: 999,
  name: "Functional Testing (Bug Hunting)",
  type: FUNCTIONAL_CAMPAIGN_TYPE_ID,
};

const project_1 = {
  id: 999,
  display_name: "Project 999",
  customer_id: 456,
  edited_by: 1,
};

const campaign_1 = {
  id: 1,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 1 title",
  customer_title: "Campaign 1 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: project_1.id,
  platform_id: 1,
  page_preview_id: 1,
  page_manual_id: 1,
  customer_id: 456,
  pm_id: 1,
  cust_bug_vis: 1,
  base_bug_internal_id: "C-",
};

const user_to_campaign_1 = {
  wp_user_id: 1,
  campaign_id: campaign_1.id,
};

describe("POST /campaigns/{cid}/users with broken createUserProfile", () => {
  useBasicWorkspaces();

  beforeAll(async () => {
    await tryber.tables.WpAppqEvdCampaign.do().insert(campaign_1);
    await tryber.tables.WpAppqUserToCampaign.do().insert(user_to_campaign_1);

    await tryber.tables.WpAppqProject.do().insert(project_1);
  });

  afterAll(async () => {
    await tryber.tables.WpAppqEvdCampaign.do().delete();
    await tryber.tables.WpAppqUserToCampaign.do().delete();
  });

  it("should answer 500 and remove the user if something goes wrong with wp_profile creation", async () => {
    const newUserEmail = "donaldo.briscola@torrebriscola.com";

    const response = await request(app)
      .post(`/campaigns/${campaign_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: newUserEmail,
      });

    const userExists = await tryber.tables.WpUsers.do()
      .select()
      .leftJoin(
        "wp_appq_evd_profile",
        "wp_appq_evd_profile.wp_user_id",
        "wp_users.ID"
      )
      .where({
        user_email: newUserEmail,
      });

    expect(response.status).toBe(500);
    expect(userExists.length).toBe(0);
  });
  // --- end of tests
});
