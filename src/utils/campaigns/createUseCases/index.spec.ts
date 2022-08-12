import UseCase from "@src/__mocks__/database/use_cases";
import { createUseCases } from ".";

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

const UseCase1: StoplightComponents["schemas"]["UseCase"] = {
  title: "Use Case 1",
  description: "Use Case 1 description",
  functionality: useCaseTemplate,
  logged: true,
  link: "https://www.google.com",
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
        ...UseCase1,
      },
      {
        ...UseCase1,
        title: "Use Case 2",
        logged: false,
      },
    ]);

    const useCases = await UseCase.all();
    expect(useCases).toHaveLength(2);
    expect(useCases[0].title).toBe(UseCase1.title);
    expect(useCases[1].title).toBe("Use Case 2");
  });

  it("should create use case even if rich formatted", async () => {
    await createUseCases([
      {
        ...UseCase1,
        description: `<h1>Use Case 1</h1><p>Cera una volta il "content"</p>`,
      },
    ]);

    const useCases = await UseCase.all();
    expect(useCases).toHaveLength(1);
    expect(useCases[0].content).toBe(
      '<h1>Use Case 1</h1><p>Cera una volta il \\"content\\"</p>'
    );
  });
  // end of describe
});
