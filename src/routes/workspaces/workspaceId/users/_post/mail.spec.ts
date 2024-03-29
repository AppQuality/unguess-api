import sgMail from "@sendgrid/mail";
import app from "@src/app";
import { tryber } from "@src/features/database";
import { useBasicWorkspaces } from "@src/features/db/hooks/basicWorkspaces";
import request from "supertest";

// Mocking sendgrid
jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
  sendMultiple: jest.fn(),
}));

// Get Mocked Function
const mockedSendgrid = jest.mocked(sgMail, true);

describe("POST /workspaces/wid/users", () => {
  const workspaces = useBasicWorkspaces();

  // Insert templates
  beforeAll(async () => {
    await tryber.tables.WpAppqUnlayerMailTemplate.do().insert({
      id: 1,
      html_body: "Test mail en {Inviter.url}",
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
      html_body: "Test mail it {Inviter.url}",
      name: "Test mail",
      json_body: "",
      last_editor_tester_id: 1,
      lang: "it",
      category_id: 1,
    });

    await tryber.tables.WpAppqEventTransactionalMail.do().insert({
      id: 2,
      event_name: "customer_invitation_it",
      template_id: 2,
      last_editor_tester_id: 1,
    });

    await tryber.tables.WpAppqUnlayerMailTemplate.do().insert({
      id: 3,
      html_body: "A special mail for a special user: {Inviter.inviteText}",
      name: "Custom mail",
      json_body: "",
      last_editor_tester_id: 1,
      lang: "it",
      category_id: 1,
    });

    await tryber.tables.WpAppqEventTransactionalMail.do().insert({
      id: 3,
      event_name: "customer_special_mail",
      template_id: 3,
      last_editor_tester_id: 1,
    });

    await tryber.tables.WpAppqUnlayerMailTemplate.do().insert({
      id: 4,
      html_body: "Test mail it {Inviter.url}",
      name: "Test mail",
      json_body: "",
      last_editor_tester_id: 1,
      lang: "it",
      category_id: 1,
    });

    await tryber.tables.WpAppqEventTransactionalMail.do().insert({
      id: 4,
      event_name: "customer_existent_invitation_it",
      template_id: 4,
      last_editor_tester_id: 1,
    });

    await tryber.tables.WpAppqUnlayerMailTemplate.do().insert({
      id: 5,
      html_body: "Test mail it from {Inviter.name} {Inviter.surname}",
      name: "Test mail",
      json_body: "",
      last_editor_tester_id: 1,
      lang: "it",
      category_id: 1,
    });

    await tryber.tables.WpAppqEventTransactionalMail.do().insert({
      id: 5,
      event_name: "customer_invitation_it_with_sender_name",
      template_id: 5,
      last_editor_tester_id: 1,
    });
  });

  // Clear templates
  afterAll(async () => {
    await tryber.tables.WpAppqUnlayerMailTemplate.do().delete();
    await tryber.tables.WpAppqEventTransactionalMail.do().delete();
  });

  // Clear mocks call counter
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should send mail", async () => {
    await request(app)
      .post(`/workspaces/${workspaces.customer_1.id}/users`)
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
        subject: "You've been invited to join UNGUESS",
        categories: ["UNGUESSAPP_STAGING"],
      })
    );
  });

  it("Should send mail with locale", async () => {
    await request(app)
      .post(`/workspaces/${workspaces.customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "vincenzo.cancelli@finestre.com",
        locale: "it",
      });

    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledTimes(1);
    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "vincenzo.cancelli@finestre.com",
        from: {
          email: "info@unguess.io",
          name: "UNGUESS",
        },
        subject: "Entra in Unguess",
        categories: ["UNGUESSAPP_STAGING"],
      })
    );
  });

  it("Should send localized signup link", async () => {
    await request(app)
      .post(`/workspaces/${workspaces.customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "vincenzo.cancelli+2@finestre.com",
        locale: "it",
      });

    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledTimes(1);
    const args: any = mockedSendgrid.sendMultiple.mock.calls[0][0];

    const invitation = await tryber.tables.WpAppqCustomerAccountInvitations.do()
      .select("token", "tester_id")
      .join(
        "wp_appq_evd_profile",
        "wp_appq_evd_profile.id",
        "wp_appq_customer_account_invitations.tester_id"
      )
      .where("email", "vincenzo.cancelli+2@finestre.com")
      .first();

    expect(invitation).toBeDefined();

    if (!invitation) throw new Error("Invitation not found");
    expect(args.html).toContain(
      `it/invites/${invitation.tester_id}/${invitation.token}`
    );
  });

  it("Should use a different template if the provided one exists", async () => {
    await request(app)
      .post(`/workspaces/${workspaces.customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "goofy.baud@saintoar.com",
        locale: "it",
        event_name: "customer_special_mail",
      });

    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledTimes(1);
    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledWith({
      to: "goofy.baud@saintoar.com",
      from: {
        email: "info@unguess.io",
        name: "UNGUESS",
      },
      html: "A special mail for a special user: ",
      subject: "Entra in Unguess",
      categories: ["UNGUESSAPP_STAGING"],
    });
  });

  it("Should use a custom message if provided", async () => {
    await request(app)
      .post(`/workspaces/${workspaces.customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "goofy.baud@saintoar.com",
        locale: "it",
        event_name: "customer_special_mail",
        message:
          "A bug is never late, Frodo. Nor is he early; he arrives precisely when he means to.",
      });

    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledTimes(1);
    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledWith(
      expect.objectContaining({
        html: "A special mail for a special user: A bug is never late, Frodo. Nor is he early; he arrives precisely when he means to.",
      })
    );
  });

  it("Should send mail also if the user already has an account", async () => {
    await request(app)
      .post(`/workspaces/${workspaces.customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "paolo.verdi@example.com",
        locale: "it",
      });

    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledTimes(1);
    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "paolo.verdi@example.com",
        from: {
          email: "info@unguess.io",
          name: "UNGUESS",
        },
        subject: `Entra in ${workspaces.customer_1.company}`,
        categories: ["UNGUESSAPP_STAGING"],
      })
    );
  });

  it("Should send mail containing the sender name", async () => {
    await request(app)
      .post(`/workspaces/${workspaces.customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "paolo.gialli@example.com",
        locale: "it",
        event_name: "customer_invitation_it_with_sender_name",
      });

    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledTimes(1);
    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining("Test mail it from Mario Rossi"),
      })
    );
  });

  // end of describe
});
