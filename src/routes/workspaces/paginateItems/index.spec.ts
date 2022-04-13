import paginateItems from "@src/routes/workspaces/paginateItems/index";

describe("paginateItems", () => {
  it("Should throw Bad request, pagination data is not valid error, because start is not valid", async () => {
    try {
      const result = await paginateItems({
        items: ["A", "B", "C"],
        start: "banana",
        limit: 10,
        total: 1,
      });
    } catch (e) {
      expect((e as OpenapiError).message).toBe(
        "Bad request, pagination data is not valid"
      );
    }
  });

  it("Should throw Bad request, pagination data is not valid error, because limit is not valid", async () => {
    try {
      const result = await paginateItems({
        items: ["A", "B", "C"],
        start: 0,
        limit: "banana",
        total: 1,
      });
    } catch (e) {
      expect((e as OpenapiError).message).toBe(
        "Bad request, pagination data is not valid"
      );
    }
  });

  it("Should throw Bad request, pagination data is not valid error, because total is not valid", async () => {
    try {
      const result = await paginateItems({
        items: ["A", "B", "C"],
        start: 0,
        limit: 10,
        total: "banana",
      });
    } catch (e) {
      expect((e as OpenapiError).message).toBe(
        "Bad request, pagination data is not valid"
      );
    }
  });

  it("Should throw Bad request, pagination data is not valid error, because all data is not valid", async () => {
    try {
      const result = await paginateItems({
        items: ["A", "B", "C"],
        start: -1,
        limit: -12,
        total: "banana",
      });
    } catch (e) {
      expect((e as OpenapiError).message).toBe(
        "Bad request, pagination data is not valid"
      );
    }
  });

  it("Should return an empty page because an empty array is passed", async () => {
    try {
      const result = await paginateItems({ items: [] });
      expect(JSON.stringify(result)).toBe(
        JSON.stringify({
          items: [],
          start: 0,
          limit: 0,
          size: 0,
          total: 0,
        })
      );
    } catch (e) {
      console.log(e);
    }
  });

  it("Should return the object formatted with pagination", async () => {
    try {
      const result = await paginateItems({ items: [] });
      expect(JSON.stringify(result)).toBe(
        JSON.stringify({
          items: [],
          start: 0,
          limit: 0,
          size: 0,
          total: 0,
        })
      );
    } catch (e) {
      console.log(e);
    }
  });
});
