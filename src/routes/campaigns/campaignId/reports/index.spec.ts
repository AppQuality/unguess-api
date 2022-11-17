import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import Reports from "@src/__mocks__/database/report";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";

const customer_1 = {
  id: 999,
  company: "Company 999",
  company_logo: "logo999.png",
  tokens: 100,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 999,
};

const project_1 = {
  id: 999,
  display_name: "Project 999",
  customer_id: 999,
};

const project_2 = {
  id: 998,
  display_name: "Project 998",
  customer_id: 10,
};

const user_to_project_1 = {
  wp_user_id: 1,
  project_id: 999,
};

const campaign_type_1 = {
  id: 999,
  name: "Functional Testing (Bug Hunting)",
  type: FUNCTIONAL_CAMPAIGN_TYPE_ID,
};

const campaign_1 = {
  id: 1,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 2 title",
  customer_title: "Campaign 2 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: project_1.id,
};

const campaign_2 = {
  id: 2,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 2 title",
  customer_title: "Campaign 2 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: project_2.id,
};

const campaign_3 = {
  id: 3,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 3 title",
  customer_title: "Campaign 3 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: project_1.id,
};

const report_1 = {
  id: 1,
  title: "Report 1 title",
  description: "Report 1 description",
  campaign_id: campaign_1.id,
  uploader_id: 1,
  url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/111/DEMO%20-%20MOBILE%20PROXIMITY%20PAYMENT%20SAMPLE%20SET%20UP%20TEST.asd.pdf",
};

const report_2 = {
  id: 2,
  title: "Report 2 title",
  description: "Report 2 description",
  campaign_id: campaign_1.id,
  uploader_id: 1,
  url: "https://google.com",
  update_date: "2017-07-20 10:00:00",
};

const report_3 = {
  id: 3,
  title: "Report 3 title",
  description: "Report 3 description",
  campaign_id: campaign_1.id,
  uploader_id: 1,
};

describe("GET /campaigns/{cid}/reports", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.add({
          companies: [customer_1],
          userToCustomers: [user_to_customer_1],
          projects: [project_1, project_2],
          userToProjects: [user_to_project_1],
          campaignTypes: [campaign_type_1],
          campaigns: [campaign_1, campaign_2, campaign_3],
        });

        await Reports.mock();

        await Reports.insert(report_1);
        await Reports.insert(report_2);
        await Reports.insert(report_3);
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  afterAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await Reports.dropMock();
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  // It should answer 403 if user is not logged in
  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).get(
      `/campaigns/${campaign_1.id}/reports`
    );
    expect(response.status).toBe(403);
  });

  // It should answer 200 with an array of reports
  it("Should answer 200 with an array of reports", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/reports`)
      .set("Authorization", `Bearer user`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      expect.objectContaining({
        id: report_1.id,
        url: report_1.url,
      }),
      expect.objectContaining({
        id: report_2.id,
        url: report_2.url,
      }),
    ]);
  });

  // It should fail if the campaign does not exist
  it("Should fail if the campaign does not exist", async () => {
    const response = await request(app)
      .get(`/campaigns/999999/reports`)
      .set("Authorization", `Bearer user`);

    expect(response.status).toBe(400);
  });

  // It should fail if the user has no permission to see the campaign's project
  it("Should fail if the user has no permission to see the campaign's project", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_2.id}/reports`)
      .set("Authorization", `Bearer user`);

    expect(response.status).toBe(403);
  });

  // It should filter out reports that have not url
  it("Should filter out reports that have not url", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/reports`)
      .set("Authorization", `Bearer user`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      expect.objectContaining({
        id: report_1.id,
        url: report_1.url,
      }),
      expect.objectContaining({
        id: report_2.id,
        url: report_2.url,
      }),
    ]);
  });

  // It should return update_date in returned reports if present
  it("Should return update_date in returned reports if present", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/reports`)
      .set("Authorization", `Bearer user`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: report_2.id,
          url: report_2.url,
          update_date: report_2.update_date,
        }),
      ])
    );
  });

  // It should return the file_type if recognized
  it("Should return the file_type if recognized", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/reports`)
      .set("Authorization", `Bearer user`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: report_1.id,
          url: report_1.url,
          file_type: {
            type: "pdf",
            extension: "pdf",
          },
        }),
      ])
    );
  });

  // It should not return the file_type if not recognized and should return the domain name
  it("Should not return the file_type if not recognized and should return the domain name", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/reports`)
      .set("Authorization", `Bearer user`);

    expect(response.status).toBe(200);
    expect(response.body[1].file_type.type).toBe("link");
    expect(response.body[1].file_type.extension).toBeUndefined();
    expect(response.body[1].file_type.domain_name).toBe("google.com");
  });

  // it should return an empty array if no reports are found
  it("Should return an empty array if no reports are found", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_3.id}/reports`)
      .set("Authorization", `Bearer user`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  describe(" /GET presentational reports", () => {
    beforeAll(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          await Reports.clear();
          await Reports.insert({
            ...report_1,
            id: 4,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.pptx",
          });
          await Reports.insert({
            ...report_1,
            id: 5,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.ppt",
          });

          resolve(true);
        } catch (error) {
          console.error(error);
          reject(error);
        }
      });
    });

    afterEach(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          await Reports.clear();
          resolve(true);
        } catch (error) {
          console.error(error);
          reject(error);
        }
      });
    });

    // It should return the file_type if recognized
    it("Should return the file_type if recognized", async () => {
      const response = await request(app)
        .get(`/campaigns/${campaign_1.id}/reports`)
        .set("Authorization", `Bearer user`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 4,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.pptx",
            file_type: {
              type: "presentation",
              extension: "pptx",
            },
          }),
          expect.objectContaining({
            id: 5,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.ppt",
            file_type: {
              type: "presentation",
              extension: "ppt",
            },
          }),
        ])
      );
    });

    // end describe presentational reports
  });

  describe(" /GET spreadsheet reports", () => {
    beforeAll(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          await Reports.clear();
          await Reports.insert({
            ...report_1,
            id: 4,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.xlsx",
          });
          await Reports.insert({
            ...report_1,
            id: 5,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.xls",
          });

          await Reports.insert({
            ...report_1,
            id: 6,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.csv",
          });

          resolve(true);
        } catch (error) {
          console.error(error);
          reject(error);
        }
      });
    });

    afterEach(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          await Reports.clear();
          resolve(true);
        } catch (error) {
          console.error(error);
          reject(error);
        }
      });
    });

    // It should return the file_type if recognized
    it("Should return the file_type if recognized", async () => {
      const response = await request(app)
        .get(`/campaigns/${campaign_1.id}/reports`)
        .set("Authorization", `Bearer user`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 4,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.xlsx",
            file_type: {
              type: "spreadsheet",
              extension: "xlsx",
            },
          }),
          expect.objectContaining({
            id: 5,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.xls",
            file_type: {
              type: "spreadsheet",
              extension: "xls",
            },
          }),
          expect.objectContaining({
            id: 6,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.csv",
            file_type: {
              type: "spreadsheet",
              extension: "csv",
            },
          }),
        ])
      );
    });

    // end describe spreadsheet reports
  });

  describe(" /GET doc reports", () => {
    beforeAll(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          await Reports.clear();
          await Reports.insert({
            ...report_1,
            id: 4,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.doc",
          });
          await Reports.insert({
            ...report_1,
            id: 5,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.docx",
          });

          resolve(true);
        } catch (error) {
          console.error(error);
          reject(error);
        }
      });
    });

    afterEach(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          await Reports.clear();
          resolve(true);
        } catch (error) {
          console.error(error);
          reject(error);
        }
      });
    });

    // It should return the file_type if recognized
    it("Should return the file_type if recognized", async () => {
      const response = await request(app)
        .get(`/campaigns/${campaign_1.id}/reports`)
        .set("Authorization", `Bearer user`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 4,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.doc",
            file_type: {
              type: "document",
              extension: "doc",
            },
          }),
          expect.objectContaining({
            id: 5,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.docx",
            file_type: {
              type: "document",
              extension: "docx",
            },
          }),
        ])
      );
    });

    // end describe doc reports
  });

  describe(" /GET archive reports", () => {
    beforeAll(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          await Reports.clear();
          await Reports.insert({
            ...report_1,
            id: 4,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.rar",
          });
          await Reports.insert({
            ...report_1,
            id: 5,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.zip",
          });

          await Reports.insert({
            ...report_1,
            id: 6,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.gzip",
          });

          await Reports.insert({
            ...report_1,
            id: 7,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.7z",
          });

          await Reports.insert({
            ...report_1,
            id: 8,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.tar",
          });

          await Reports.insert({
            ...report_1,
            id: 9,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.gz",
          });

          resolve(true);
        } catch (error) {
          console.error(error);
          reject(error);
        }
      });
    });

    afterEach(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          await Reports.clear();
          resolve(true);
        } catch (error) {
          console.error(error);
          reject(error);
        }
      });
    });

    // It should return the file_type if recognized
    it("Should return the file_type if recognized", async () => {
      const response = await request(app)
        .get(`/campaigns/${campaign_1.id}/reports`)
        .set("Authorization", `Bearer user`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(6);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 4,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.rar",
            file_type: {
              type: "archive",
              extension: "rar",
            },
          }),
          expect.objectContaining({
            id: 5,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.zip",
            file_type: {
              type: "archive",
              extension: "zip",
            },
          }),
          expect.objectContaining({
            id: 6,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.gzip",
            file_type: {
              type: "archive",
              extension: "gzip",
            },
          }),
          expect.objectContaining({
            id: 7,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.7z",
            file_type: {
              type: "archive",
              extension: "7z",
            },
          }),
          expect.objectContaining({
            id: 8,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.tar",
            file_type: {
              type: "link",
              // extension: "tar", // tar is not officially supported by the library
            },
          }),
          expect.objectContaining({
            id: 9,
            url: "https://s3-eu-west-1.amazonaws.com/crowd.appq.testbucket/report/115/DEMO%20-%20MOCKUP%20VALIDATION%20SAMPLE%20SET%20UP%20TEST.gz",
            file_type: {
              type: "archive",
              extension: "gz",
            },
          }),
        ])
      );
    });

    // end describe archive reports
  });
});
