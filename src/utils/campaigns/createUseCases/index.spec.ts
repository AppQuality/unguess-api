import UseCase from "@src/__mocks__/database/use_cases";
import { createUseCases } from ".";

const useCaseTemplate: StoplightComponents["schemas"]["Template"] = {
  title: "Use Case 1",
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

describe("createUseCases", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await UseCase.mock();
      } catch (error) {
        console.log(error);
        reject(error);
      }

      resolve(true);
    });
  });

  afterAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await UseCase.dropMock();
      } catch (error) {
        console.log(error);
        reject(error);
      }

      resolve(true);
    });
  });

  afterEach(async () => {
    await UseCase.clear();
  });

  it("should return an empty array if no use cases are provided", async () => {
    const useCases = await createUseCases();

    expect(useCases).toEqual([]);
  });

  it("should return an empty array if an empty usecase array is provided", async () => {
    const useCases = await createUseCases();

    expect(useCases).toEqual([]);
  });

  it("should return an array of use cases", async () => {
    await createUseCases([
      {
        ...useCaseTemplate,
      },
      {
        ...useCaseTemplate,
        title: "Use Case 2",
        requiresLogin: false,
      },
    ]);

    const useCases = await UseCase.all();
    expect(useCases).toHaveLength(2);
  });

  // end of describe
});
