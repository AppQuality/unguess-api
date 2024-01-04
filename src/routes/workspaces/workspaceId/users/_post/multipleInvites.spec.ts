import sgMail from "@sendgrid/mail";
import app from "@src/app";
import { tryber } from "@src/features/database";
import { useBasicWorkspaces } from "@src/features/db/hooks/basicWorkspaces";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";
import request from "supertest";

// Mocking sendgrid
jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
  sendMultiple: jest.fn(),
}));

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

// Get Mocked Function
const mockedSendgrid = jest.mocked(sgMail, true);

describe("POST /campaigns/{cid}/users mail checks", () => {
  const context = useBasicWorkspaces();

  beforeAll(async () => {
    await tryber.tables.WpAppqEvdCampaign.do().insert(campaign_1);

    await tryber.tables.WpAppqProject.do().insert(project_1);
    await tryber.tables.WpAppqCustomer.do().insert({
      id: 200,
      email: "",
      company: "Test Company",
      pm_id: 1,
    });
    await tryber.tables.WpAppqUserToCustomer.do().insert({
      wp_user_id: 1,
      customer_id: 200,
    });

    await tryber.tables.WpAppqEvdCampaign.do().insert({ ...campaign_1, id: 2 });
    await tryber.tables.WpAppqUserToCampaign.do().insert({
      wp_user_id: 1,
      campaign_id: 2,
    });
    await tryber.tables.WpAppqUnlayerMailTemplate.do().insert({
      id: 1,
      html_body: "User Creation {Inviter.url}",
      name: "Test mail",
      json_body: "",
      last_editor_tester_id: 1,
      lang: "en",
      category_id: 1,
    });

    await tryber.tables.WpAppqEventTransactionalMail.do().insert({
      id: 1,
      event_name: "customer_invitation_en",
      template_id: 1,
      last_editor_tester_id: 1,
    });
    await tryber.tables.WpAppqUnlayerMailTemplate.do().insert({
      id: 2,
      html_body: "User Invite {Inviter.url}",
      name: "Test mail",
      json_body: "",
      last_editor_tester_id: 1,
      lang: "en",
      category_id: 1,
    });

    await tryber.tables.WpAppqEventTransactionalMail.do().insert({
      id: 2,
      event_name: "customer_existent_invitation_en",
      template_id: 2,
      last_editor_tester_id: 1,
    });
  });

  afterAll(async () => {
    await tryber.tables.WpAppqEvdCampaign.do().delete();
    await tryber.tables.WpAppqUserToCampaign.do().delete();
    await tryber.tables.WpAppqCustomer.do().delete();
    await tryber.tables.WpAppqUnlayerMailTemplate.do().delete();
    await tryber.tables.WpAppqEventTransactionalMail.do().delete();
  });

  // Clear mocks call counter
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should send invite mail again if the first one is not confirmed", async () => {
    await request(app)
      .post(`/workspaces/${context.customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "vincenzo.cancelli@finestre.com",
      });

    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledTimes(1);
    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "vincenzo.cancelli@finestre.com",
        from: {
          email: "info@unguess.io",
          name: "UNGUESS",
        },
        html: expect.stringContaining("User Creation"),
        subject: "You've been invited to join UNGUESS",
        categories: ["UNGUESSAPP_STAGING"],
      })
    );

    jest.clearAllMocks();

    await request(app)
      .post(`/workspaces/200/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "vincenzo.cancelli@finestre.com",
      });

    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledTimes(1);
    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "vincenzo.cancelli@finestre.com",
        from: {
          email: "info@unguess.io",
          name: "UNGUESS",
        },
        html: expect.stringContaining("User Creation"),
        subject: "You've been invited to join UNGUESS",
        categories: ["UNGUESSAPP_STAGING"],
      })
    );
  });
});
