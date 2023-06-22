import sgMail from "@sendgrid/mail";
import app from "@src/app";
import { tryber } from "@src/features/database";
import { useBasicProjectsContext } from "@src/features/db/hooks/basicProjects";
import request from "supertest";

// Mocking sendgrid
jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

// Get Mocked Function
const mockedSendgrid = jest.mocked(sgMail, true);

describe("POST /projects/pid/users", () => {
  const context = useBasicProjectsContext();

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
      event_name: "project_invitation_en",
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
      event_name: "project_invitation_it",
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
      html_body: "Test mail it",
      name: "Test mail",
      json_body: "",
      last_editor_tester_id: 1,
      lang: "it",
      category_id: 1,
    });

    await tryber.tables.WpAppqEventTransactionalMail.do().insert({
      id: 4,
      event_name: "project_existent_invitation_it",
      template_id: 4,
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
      .post(`/projects/${context.prj1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "vincenzo.cancelli@finestre.com",
      });

    expect(mockedSendgrid.send).toHaveBeenCalledTimes(1);
    expect(mockedSendgrid.send).toHaveBeenCalledWith(
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
      .post(`/projects/${context.prj1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "vincenzo.cancelli@finestre.com",
        locale: "it",
      });

    expect(mockedSendgrid.send).toHaveBeenCalledTimes(1);
    expect(mockedSendgrid.send).toHaveBeenCalledWith(
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
      .post(`/projects/${context.prj1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "vincenzo.cancelli+2@finestre.com",
        locale: "it",
      });

    expect(mockedSendgrid.send).toHaveBeenCalledTimes(1);
    const args: any = mockedSendgrid.send.mock.calls[0][0];

    expect(args.html).toContain("it/invites/");
  });

  it("Should use a different template if the provided one exists", async () => {
    await request(app)
      .post(`/projects/${context.prj1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "goofy.baud@saintoar.com",
        locale: "it",
        event_name: "customer_special_mail",
      });

    expect(mockedSendgrid.send).toHaveBeenCalledTimes(1);
    expect(mockedSendgrid.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "goofy.baud@saintoar.com",
        from: {
          email: "info@unguess.io",
          name: "UNGUESS",
        },
        html: "A special mail for a special user: ",
        subject: "Entra in Unguess",
        categories: ["UNGUESSAPP_STAGING"],
      })
    );
  });

  it("Should use a custom message if provided", async () => {
    await request(app)
      .post(`/projects/${context.prj1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "goofy.baud@saintoar.com",
        locale: "it",
        event_name: "customer_special_mail",
        message:
          "A bug is never late, Frodo. Nor is he early; he arrives precisely when he means to.",
      });

    expect(mockedSendgrid.send).toHaveBeenCalledTimes(1);
    expect(mockedSendgrid.send).toHaveBeenCalledWith(
      expect.objectContaining({
        html: "A special mail for a special user: A bug is never late, Frodo. Nor is he early; he arrives precisely when he means to.",
      })
    );
  });

  it("Should send mail also if the user already has an account", async () => {
    await request(app)
      .post(`/projects/${context.prj1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "paolo.verdi@example.com",
        locale: "it",
      });

    expect(mockedSendgrid.send).toHaveBeenCalledTimes(1);
    expect(mockedSendgrid.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "paolo.verdi@example.com",
        from: {
          email: "info@unguess.io",
          name: "UNGUESS",
        },
        html: "Test mail it",
        subject: `Entra in ${context.prj1.display_name}`,
        categories: ["UNGUESSAPP_STAGING"],
      })
    );
  });

  // end of describe
});
