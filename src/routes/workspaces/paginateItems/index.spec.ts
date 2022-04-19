import paginateItems from "@src/routes/workspaces/paginateItems/index";
import { ERROR_MESSAGE } from "@src/routes/shared";

describe("paginateItems", () => {
  it("Should throw Bad request, pagination data is not valid error, because start is not valid", async () => {
    const result = await paginateItems({
      items: ["A", "B", "C"],
      start: "banana",
      limit: 10,
      total: 1,
    });

    expect(result).toMatchObject(
      JSON.stringify({
        statusCode: 400,
        message: ERROR_MESSAGE,
      })
    );
  });

  it("Should throw Bad request, pagination data is not valid error, because limit is not valid", async () => {
    const result = await paginateItems({
      items: ["A", "B", "C"],
      start: 0,
      limit: "banana",
      total: 1,
    });

    expect(result).toMatchObject(
      JSON.stringify({
        statusCode: 400,
        message: ERROR_MESSAGE,
      })
    );
  });

  it("Should throw Bad request, pagination data is not valid error, because total is not valid", async () => {
    const result = await paginateItems({
      items: ["A", "B", "C"],
      start: 0,
      limit: 10,
      total: "banana",
    });

    expect(result).toMatchObject(
      JSON.stringify({
        statusCode: 400,
        message: ERROR_MESSAGE,
      })
    );
  });

  it("Should throw Bad request, pagination data is not valid error, because all data is not valid", async () => {
    const result = await paginateItems({
      items: ["A", "B", "C"],
      start: -1,
      limit: -12,
      total: "banana",
    });

    expect(result).toMatchObject(
      JSON.stringify({
        statusCode: 400,
        message: ERROR_MESSAGE,
      })
    );
  });

  it("Should return an empty page because an empty array is passed", async () => {
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
  });

  it("Should return the object formatted with pagination", async () => {
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
  });
});
