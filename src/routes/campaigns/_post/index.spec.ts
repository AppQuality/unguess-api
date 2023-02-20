import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { data as platformData } from "@src/__mocks__/database/platforms";
import {
  DEFAULT_EXPRESS_COST,
  DT_DESKTOP,
  DT_SMARTPHONE,
  fallBackCsmProfile,
  FUNCTIONAL_CAMPAIGN_TYPE_ID,
} from "@src/utils/constants";
import {
  getExpressCost,
  getWorkspaceCoinsTransactions,
} from "@src/utils/workspaces";

import sqlite from "@src/features/sqlite";
import UseCase from "@src/__mocks__/database/use_cases";
import useCaseGroup from "@src/__mocks__/database/use_case_group";

const customer_1 = {
  id: 1,
  company: "Company 1",
  company_logo: "logo1.png",
  tokens: 100,
};

const customer_2 = {
  id: 2,
  company: "Company 2",
  company_logo: "logo2.png",
  tokens: 100,
};

const AndroidPhone = {
  id: 1,
  name: "Android",
  form_factor: DT_SMARTPHONE,
};

const iOSPhone = {
  id: 2,
  name: "iOS",
  form_factor: DT_SMARTPHONE,
};

const AndroidPhoneBody = {
  id: 1,
  name: "Android",
  deviceType: DT_SMARTPHONE,
};

const WindowsPC = {
  id: 8,
  name: "Windows",
  form_factor: DT_DESKTOP,
};

const WindowsPCBody = {
  id: 8,
  name: "Windows",
  deviceType: DT_DESKTOP,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 1,
};

const user_to_customer_2 = {
  wp_user_id: 1,
  customer_id: 2,
};

const project_1 = {
  id: 1,
  display_name: "Project 1",
  customer_id: 1,
};

const project_2 = {
  id: 2,
  display_name: "Project 2",
  customer_id: 1,
};

const project_3 = {
  id: 3,
  display_name: "Project 3",
  customer_id: 1,
};

const user_to_project_1 = {
  wp_user_id: 1,
  project_id: 1,
};

const user_to_project_2 = {
  wp_user_id: 2,
  project_id: 2,
};

const campaign_request_1 = {
  title: "Campaign 1 title",
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  customer_title: "Campaign 1 customer title",
  is_public: 1,
  campaign_type_id: 1,
  project_id: 1,
  pm_id: fallBackCsmProfile.id,
  customer_id: customer_1.id,
  express_slug: "express-slug",
};

const campaign_request_2 = {
  title: "Campaign 2 title",
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  customer_title: "Campaign 2 customer title",
  is_public: 1,
  campaign_type_id: 1,
  project_id: 1,
  pm_id: fallBackCsmProfile.id,
  customer_id: customer_2.id,
  express_slug: "express-free",
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
  campaign_type_id: 1,
  campaign_type: -1,
  project_id: 1,
};

const campaign_type_1 = {
  id: 1,
  name: "Functional Testing (Bug Hunting)",
  type: FUNCTIONAL_CAMPAIGN_TYPE_ID,
};

const coins_1 = {
  amount: 10,
  customer_id: 1,
};

const express_1 = {
  slug: "express-slug",
  cost: DEFAULT_EXPRESS_COST,
};

const express_2 = {
  slug: "express-free",
};

const express_3 = {
  slug: "unmoderated-usability-testing",
  cost: DEFAULT_EXPRESS_COST,
};

const useCaseTemplate: StoplightComponents["schemas"]["Template"] = {
  title: "Use Template Case 1",
  description: "Use Case 1 description",
  content: "<h1>Use Case 1</h1><p>content</p>",
  device_type: "webapp",
  requiresLogin: true,
  category: {
    id: 1,
    name: "Category 1",
  },
  locale: "it",
  image: "https://placehold.it/300x300",
};

const UseCase1 = {
  title: "Use Case 1",
  description: "Use Case 1 description",
  requiresLogin: false,
  functionality: useCaseTemplate,
  logged: true,
  link: "https://www.google.com",
};

describe("POST /campaigns", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.add({
          companies: [customer_1, customer_2],
          userToCustomers: [user_to_customer_1, user_to_customer_2],
          projects: [project_1, project_2, project_3],
          userToProjects: [user_to_project_1, user_to_project_2],
          campaigns: [campaign_1],
          campaignTypes: [campaign_type_1],
          coins: [coins_1],
          express: [express_1, express_2, express_3],
        });

        await platformData.addItem(AndroidPhone);
        await platformData.addItem(iOSPhone);
        await platformData.addItem(WindowsPC);
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  beforeEach(async () => {
    await UseCase.clear();
    await useCaseGroup.clear();
  });

  it("Should answer 403 if not logged in", async () => {
    const response = await request(app)
      .post("/campaigns")
      .send(campaign_request_1);
    expect(response.status).toBe(403);
  });

  it("Should answer 400 if the request body doesn't have campaign request schema required fields", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer user")
      .send({
        start_date: "2020-01-01",
        end_date: "2020-01-01",
        close_date: "2020-01-01",
        title: "Campaign 1 title",
        customer_title: "Campaign 1 customer title",
      });
    expect(response.status).toBe(400);
  });

  it("Should answer 403 if the user is not part of the project", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer user")
      .send({
        ...campaign_request_1,
        platforms: [AndroidPhoneBody, WindowsPCBody],
        project_id: 999,
      });
    console.log(response.body);
    expect(response.status).toBe(403);
  });

  it("Should answer 403 if the project doesn't exist", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer user")
      .send({
        ...campaign_request_1,
        platforms: [AndroidPhoneBody, WindowsPCBody],
        project_id: 999,
      });
    expect(response.status).toBe(403);
  });

  it("Should answer 200 with a campaign object", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer user")
      .send({
        ...campaign_request_1,
        platforms: [AndroidPhoneBody, WindowsPCBody],
      });
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        title: campaign_1.title,
        customer_title: campaign_1.customer_title,
        is_public: campaign_1.is_public,
        start_date: campaign_1.start_date,
        end_date: campaign_1.end_date,
        close_date: campaign_1.close_date,
        bug_form: campaign_1.campaign_type,
        status: {
          id: campaign_1.status_id,
          name: "running",
        },
        type: {
          id: campaign_1.campaign_type_id,
          name: campaign_type_1.name,
        },
        family: {
          id: campaign_type_1.type,
          name: "Functional",
        },
        project: {
          id: project_1.id,
          name: project_1.display_name,
        },
      })
    );
  });

  it("Should have description and internal_id filled", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer user")
      .send({
        ...campaign_request_1,
        platforms: [AndroidPhoneBody, WindowsPCBody],
      });
    expect(response.status).toBe(200);

    // Check that description and internal_id are filled
    expect(response.body.description).toBeDefined();
    expect(response.body.base_bug_internal_id).toBeDefined();
  });

  // A coins transaction should be created after campaign creation
  it("A coins transaction should be created after campaign creation", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer user")
      .send({
        ...campaign_request_1,
        platforms: [AndroidPhoneBody, WindowsPCBody],
      });
    expect(response.status).toBe(200);

    // Check if transaction exists
    const transaction = await getWorkspaceCoinsTransactions({
      workspaceId: campaign_request_1.customer_id,
      campaignId: response.body.id,
    });

    // Check if cost is correct
    const cost = await getExpressCost({
      slug: campaign_request_1.express_slug,
    });

    expect(transaction).toEqual([
      expect.objectContaining({
        campaign_id: response.body.id,
        quantity: cost,
      }),
    ]);
  });

  // Should create a campaign if the workspace has no coins but the express has cost 0
  it("Should create a campaign if the workspace has no coins but the express has cost 0", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer user")
      .send({
        ...campaign_request_2,
        express_slug: express_2.slug,
        platforms: [AndroidPhoneBody, WindowsPCBody],
      });
    expect(response.status).toBe(200);

    const tryberDb = sqlite("tryber");
    const campaigns = await tryberDb.all(
      `SELECT * FROM wp_appq_evd_campaign WHERE id = ${response.body.id}`
    );

    expect(campaigns.length).toBe(1);
    expect(campaigns[0]).toHaveProperty(
      "project_id",
      campaign_request_2.project_id
    );
  });

  // Should create the use cases if some are provided
  it("Should create the use cases if some are provided", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer user")
      .send({
        ...campaign_request_2,
        express_slug: express_2.slug,
        platforms: [AndroidPhoneBody, WindowsPCBody],
        use_cases: [UseCase1, { ...UseCase1, title: "Use case 2" }],
      });

    expect(response.status).toBe(200);

    const useCases = await UseCase.all(undefined, [
      { campaign_id: response.body.id },
    ]);
    expect(useCases).toHaveLength(2);
  });

  it("Should raise an error if one or more use case are malformed", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer user")
      .send({
        ...campaign_request_2,
        express_slug: express_2.slug,
        platforms: [AndroidPhoneBody, WindowsPCBody],
        use_cases: [UseCase1, { title: "Use case 2" }],
      });

    expect(response.status).toBe(400);

    const useCases = await UseCase.all();
    expect(useCases).toHaveLength(0);
  });

  it("Should not create use case if campaign is malformed", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer user")
      .send({
        ...campaign_request_2,
        express_slug: "pippo",
        platforms: [AndroidPhoneBody, WindowsPCBody],
        use_cases: [UseCase1, { title: "Use case 2" }],
      });

    expect(response.status).toBe(400);

    const useCases = await UseCase.all();
    expect(useCases).toHaveLength(0);
  });

  it("Should return an error if the use cases provided doesn't contains all required fields", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer user")
      .send({
        ...campaign_request_2,
        express_slug: express_2.slug,
        platforms: [AndroidPhoneBody, WindowsPCBody],
        use_cases: [{ title: "Use case 2" }],
      });

    const useCases = await UseCase.all(undefined, [
      { campaign_id: response.body.id },
    ]);

    expect(response.status).toBe(400);
    expect(useCases).toHaveLength(0);
  });

  it("Should create the campaign and the usecase with an experiential cp provided", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer user")
      .send({
        title: "PROVA - NON RUNNARE",
        start_date: "2022-08-12 13:05:18",
        end_date: "2022-08-16 13:05:18",
        close_date: "2022-08-16 13:05:18",
        customer_title: "PROVA - NON RUNNARE",
        campaign_type_id: 1,
        project_id: 1,
        pm_id: 20739,
        platforms: [
          { id: 1, deviceType: 0 },
          { id: 2, deviceType: 0 },
        ],
        customer_id: 1,
        express_slug: "unmoderated-usability-testing",
        use_cases: [
          {
            title: "Example exp use case",
            logged: false,
            description:
              "<p>Stai per testare la funzionalità “Registrazione e Login” il cui scopo è “permettere all’utente di autenticarsi al servizio”.</p><h4>Per testare [edited 📝 il funzionamento:</h4><ul><li><p>Effettua la registrazione di un nuovo account, inserendo tutti i dati richiesti</p></li><li><p>Prova ad effettuare il login e il logout più volte</p></li><li><p>[SE PREVISTO] Prova poi a effettuare la registrazione e il login anche tramite i social presenti</p></li><li><p>Prova a stressare anche il processo di recupero della password</p></li></ul><p><strong>Assicurati che:</strong></p><ul><li><p>Il processo e le azioni richieste vengano sempre portate a buon fine, già dal primo tentativo</p></li><li><p>verifica il flusso e la corretta gestione dei campi (obbligatorietà, errori, check automatici)</p></li></ul>",
            link: "",
          },
        ],
      });

    const useCases = await UseCase.all(undefined, [
      { campaign_id: response.body.id },
    ]);

    expect(response.status).toBe(200);
    expect(useCases).toHaveLength(1);
  });

  it("Should create the use cases also with a custom functionality", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer user")
      .send({
        ...campaign_request_2,
        express_slug: express_2.slug,
        platforms: [AndroidPhoneBody, WindowsPCBody],
        use_cases: [
          UseCase1,
          {
            ...UseCase1,
            title: "Use case 2",
            functionality: {
              id: -1,
              title: "Custom functionality",
            },
          },
        ],
      });

    expect(response.status).toBe(200);

    const useCases = await UseCase.all(undefined, [
      { campaign_id: response.body.id },
    ]);
    expect(useCases).toHaveLength(2);
  });

  it("Should create the use cases if some are provided with a default group definition", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer user")
      .send({
        ...campaign_request_2,
        express_slug: express_2.slug,
        platforms: [AndroidPhoneBody, WindowsPCBody],
        use_cases: [UseCase1, { ...UseCase1, title: "Use case 2" }],
      });

    expect(response.status).toBe(200);

    const useCases = await UseCase.all(undefined, [
      { campaign_id: response.body.id },
    ]);

    const groups = await useCaseGroup.all();

    expect(groups).toHaveLength(2);

    expect(groups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ task_id: useCases[0].id }),
        expect.objectContaining({ task_id: useCases[1].id }),
      ])
    );
  });

  it("Should answer 200 with a campaign object with bug form enabled if provided", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer user")
      .send({
        ...campaign_request_1,
        has_bug_form: 1,
        platforms: [AndroidPhoneBody, WindowsPCBody],
      });
    expect(response.status).toBe(200);
    expect(response.body.bug_form).toEqual(0);
  });

  it("Should answer 200 with a campaign object with bug parade enabled if provided", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer user")
      .send({
        ...campaign_request_1,
        has_bug_form: 1,
        has_bug_parade: 1,
        platforms: [AndroidPhoneBody, WindowsPCBody],
      });
    expect(response.status).toBe(200);
    expect(response.body.bug_form).toEqual(1);
  });

  it("Should answer 400 if a campaign object is provided with bug parade enabled and bug form disabled", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer user")
      .send({
        ...campaign_request_1,
        has_bug_form: 0,
        has_bug_parade: 1,
        platforms: [AndroidPhoneBody, WindowsPCBody],
      });
    expect(response.status).toBe(400);
  });

  // end of tests
});
