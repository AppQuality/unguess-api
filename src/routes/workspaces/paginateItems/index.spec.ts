import paginateItems from "@src/routes/workspaces/paginateItems/index";
import { ERROR_MESSAGE } from "@src/routes/shared";

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
  campaign_type_name: "Campaign Type 1",
  test_type_id: 1,
  test_type_name: "Test Type 1",
  project_id: 1,
  project_name: "Project 1",
  customer_id: 1,
};

describe("paginateItems", () => {
  it("Should return an error because start is not valid", async () => {
    const result = await paginateItems({
      items: [campaign_1],
      start: -1,
      limit: 10,
      total: 1,
    });

    expect(JSON.stringify(result)).toStrictEqual(
      JSON.stringify({
        message: ERROR_MESSAGE,
        code: 400,
        error: true,
      })
    );
  });

  it("Should return an error because limit is not valid", async () => {
    const result = await paginateItems({
      items: [campaign_1],
      start: 0,
      limit: -1,
      total: 1,
    });

    expect(JSON.stringify(result)).toStrictEqual(
      JSON.stringify({
        message: ERROR_MESSAGE,
        code: 400,
        error: true,
      })
    );
  });

  it("Should return an error because total is not valid", async () => {
    const result = await paginateItems({
      items: [campaign_1],
      start: 0,
      limit: 10,
      total: null,
    });

    expect(JSON.stringify(result)).toStrictEqual(
      JSON.stringify({
        message: ERROR_MESSAGE,
        code: 400,
        error: true,
      })
    );
  });

  it("Should return an error because all data is not valid", async () => {
    const result = await paginateItems({
      items: [campaign_1],
      start: -1,
      limit: -1,
      total: null,
    });

    expect(JSON.stringify(result)).toStrictEqual(
      JSON.stringify({
        message: ERROR_MESSAGE,
        code: 400,
        error: true,
      })
    );
  });

  it("Should return an empty page because a formatted empty array if an empty list of items is passed", async () => {
    const result = await paginateItems({ items: [] });
    expect(JSON.stringify(result)).toStrictEqual(
      JSON.stringify({
        items: [],
        start: 0,
        limit: 0,
        size: 0,
        total: 0,
      })
    );
  });
});
