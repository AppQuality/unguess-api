import { paginateItems } from "@src/utils/paginateItems";

const campaign_1 = {
  id: 42,
  start_date: "2017-07-20 00:00:00",
  end_date: "2017-07-20 00:00:00",
  close_date: "2017-07-20 00:00:00",
  title: "Campagnetta Provetta ",
  customer_title: "titolo",
  description: "Descrizione della campagnazione",
  status_id: 1,
  status_name: "In Progress",
  is_public: 0,
  campaign_type_id: 1,
  campaign_type_name: "Campaign Type 1",
  campaign_family_id: 1,
  campaign_family_name: "Functional",
  project_id: 1,
  project_name: "Project 1",
  customer_id: 1,
};

describe("paginateItems", () => {
  it("Should return a paginated item", async () => {
    const result = await paginateItems({ items: [campaign_1], total: 1 });
    expect(JSON.stringify(result)).toStrictEqual(
      JSON.stringify({
        items: [campaign_1],
        size: 1,
        total: 1,
      })
    );
  });

  it("Should return an empty page because a formatted empty array if an empty list of items is passed", async () => {
    const result = await paginateItems({ items: [], total: 0 });
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
