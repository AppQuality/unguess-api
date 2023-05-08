import sgMail from "@sendgrid/mail";
import app from "@src/app";
import { tryber } from "@src/features/database";
import { useBasicWorkspaces } from "@src/features/db/hooks/basicWorkspaces";
import request from "supertest";

// Mocking sendgrid
jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

// Get Mocked Function
const mockedSendgrid = jest.mocked(sgMail, true);

describe("POST /workspaces/wid/users", () => {
  const workspaces = useBasicWorkspaces();

  // Insert templates
  beforeAll(async () => {
    await tryber.tables.WpAppqUnlayerMailTemplate.do().insert({
      id: 1,
      html_body: "Test mail en",
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
      html_body: "Test mail it",
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
      html_body: "A special mail for a special user",
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

    expect(mockedSendgrid.send).toHaveBeenCalledTimes(1);
    expect(mockedSendgrid.send).toHaveBeenCalledWith({
      to: "vincenzo.cancelli@finestre.com",
      from: {
        email: "info@unguess.io",
        name: "UNGUESS",
      },
      html: "Test mail en",
      subject: "You've been invited to join UNGUESS",
      categories: ["UNGUESSAPP_STAGING"],
    });
  });

  it("Should send mail with locale", async () => {
    await request(app)
      .post(`/workspaces/${workspaces.customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "vincenzo.cancelli@finestre.com",
        locale: "it",
      });

    expect(mockedSendgrid.send).toHaveBeenCalledTimes(1);
    expect(mockedSendgrid.send).toHaveBeenCalledWith({
      to: "vincenzo.cancelli@finestre.com",
      from: {
        email: "info@unguess.io",
        name: "UNGUESS",
      },
      html: "Test mail it",
      subject: "Entra in Unguess",
      categories: ["UNGUESSAPP_STAGING"],
    });
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

    expect(mockedSendgrid.send).toHaveBeenCalledTimes(1);
    expect(mockedSendgrid.send).toHaveBeenCalledWith({
      to: "goofy.baud@saintoar.com",
      from: {
        email: "info@unguess.io",
        name: "UNGUESS",
      },
      html: "A special mail for a special user",
      subject: "Entra in Unguess",
      categories: ["UNGUESSAPP_STAGING"],
    });
  });
});