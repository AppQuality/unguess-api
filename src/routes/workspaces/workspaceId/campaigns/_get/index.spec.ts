import app from "@src/app";
import request from "supertest";
import db from "@src/features/sqlite";

jest.mock("@src/features/db");
jest.mock("@appquality/wp-auth");

const unguessDb = db("unguess");
const tryberDb = db("tryber");

const campaign_1 = {
  id: 42,
  start_date: "2017-07-20 00:00:00",
  end_date: "2017-07-20 00:00:00",
  close_date: "2017-07-20 00:00:00",
  title: "Campagnetta Provetta ",
  customer_title: "titolo",
  description: "Descrizione della campagnazione",
  status_id: 1,
  is_public: 0,
  campaign_type_id: 1,
  project_id: 1,
  customer_id: 1,
};

const campaign_2 = {
  id: 43,
  start_date: "2017-07-20 00:00:00",
  end_date: "2017-07-20 00:00:00",
  close_date: "2017-07-20 00:00:00",
  title: "Campagnetta Provetta ",
  customer_title: "titolo",
  description: "Descrizione della campagnazione",
  status_id: 1,
  is_public: 0,
  campaign_type_id: 1,
  project_id: 1,
  customer_id: 2,
};

const campaign_3 = {
  id: 44,
  start_date: "2017-07-20 00:00:00",
  end_date: "2017-07-20 00:00:00",
  close_date: "2017-07-20 00:00:00",
  title: "Campagnetta Provetta ",
  customer_title: "titolo",
  description: "Descrizione della campagnazione",
  status_id: 1,
  is_public: 0,
  campaign_type_id: 1,
  project_id: 3,
  customer_id: 3,
};

//TODO PROJECT NAME FROM TABLE

describe("GET /workspaces/{wid}/campaigns", () => {
  beforeAll(async () => {
    return new Promise(async (resolve) => {
      try {
        await tryberDb.createTable("appq_edv_campaign", [
          "id int(11) PRIMARY KEY",
          "start_date datetime",
          "end_date datetime",
          "close_date datetime",
          "title varchar(256)",
          "customer_title varchar(256)",
          "description varchar(512)",
          "status_id int(1)",
          "is_public int(1)",
          "campaign_type_id int(11)",
          "project_id int(11)",
          "customer_id int(11)",
        ]);
        await tryberDb.insert("appq_edv_campaign", campaign_1);
        await tryberDb.insert("appq_edv_campaign", campaign_2);
        await tryberDb.insert("appq_edv_campaign", campaign_3);
      } catch (e) {
        console.log(e);
      }
      resolve(true);
    });
  });

  afterAll(async () => {
    return new Promise(async (resolve) => {
      try {
        await tryberDb.dropTable("appq_edv_campaign");
      } catch (error) {
        console.error(error);
      }
      resolve(true);
    });
  });

  it("Should return 200 status", async () => {
    const response = await request(app)
      .get("/workspaces/1/campaigns")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
  });

  it("Should return an array of campaigns", async () => {
    const response = await request(app)
      .get("/workspaces/1/campaigns")
      .set("authorization", "Bearer customer");
    const project_name = "aggiunto da qui";
    expect(JSON.stringify(response.body)).toBe(
      JSON.stringify([
        {
          id: campaign_1.id,
          start_date: campaign_1.start_date,
          end_date: campaign_1.end_date,
          close_date: campaign_1.close_date,
          title: campaign_1.title,
          customer_title: campaign_1.customer_title,
          description: campaign_1.description,
          status_id: campaign_1.status_id,
          is_public: campaign_1.is_public,
          campaign_type_id: campaign_1.campaign_type_id,
          project_id: campaign_1.project_id,
          customer_id: campaign_1.project_id,
          project_name,
        },
      ])
    );
  });

  it('Should throw "No campaign found" error if no campaign are found', async () => {
    try {
      await request(app)
        .get("/workspaces/567/campaigns")
        .set("authorization", "Bearer customer");
      fail("Should throw error");
    } catch (e) {
      console.log(e);
      expect((e as OpenapiError).message).toBe("No campaign found");
    }
  });
});
