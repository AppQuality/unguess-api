import app from "@src/app";
import request from "supertest";

jest.doMock("fs", () => ({
  ...jest.requireActual("fs"),
  readFileSync: jest.fn((p) => {
    if (p === ".git/HEAD") {
      return "ref: refs/heads/a-wizard-is-never-late-frodo-baggins-nor-is-he-early";
    }

    if (
      p ===
      ".git/refs/heads/a-wizard-is-never-late-frodo-baggins-nor-is-he-early"
    ) {
      return "480bf12e98245bc1e7ed5629c5d758eb66ff2bf8";
    }

    return "Some say the world will end in fire, Some say in ice. From what I've tasted of desire I hold with those who favor fire ... And would suffice.";
  }),
  existsSync: jest.fn(() => true),
}));

describe("GET /", () => {
  //   afterEach(() => {
  //     jest.restoreAllMocks();
  //   });

  it("Should retrieve the revision", async () => {
    const response = await request(app).get("/");

    expect(response.body.revision).toBe("480bf1");
    expect(response.body.branch).toBe(
      "a-wizard-is-never-late-frodo-baggins-nor-is-he-early"
    );
  });
});
