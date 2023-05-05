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
        email: "it@tryber.me",
        name: "Tryber",
      },
      html: "Test mail en",
      subject: "You've been invited to join UNGUESS",
      categories: ["Test"],
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
        email: "it@tryber.me",
        name: "Tryber",
      },
      html: "Test mail it",
      subject: "Entra in Unguess",
      categories: ["Test"],
    });
  });
});
