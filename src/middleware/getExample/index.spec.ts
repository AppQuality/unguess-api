import getExample from ".";

describe("Get Example middleware", () => {
  it("should return a middleware", () => {
    expect(getExample).toBeInstanceOf(Function);
  });
  it("Should return false if path does not exists", () => {
    const result = getExample(
      { definition: { paths: {} } },
      "/endpoint",
      "get",
      "400",
      undefined
    );
    expect(result).toBe(false);
  });
  it("Should return false if path does not have method", () => {
    const result = getExample(
      { definition: { paths: { "/endpoint": {} } } },
      "/endpoint",
      "get",
      "400",
      undefined
    );
    expect(result).toBe(false);
  });
  it("Should return false if path method does not have response", () => {
    const result = getExample(
      { definition: { paths: { "/endpoint": { get: { responses: {} } } } } },
      "/endpoint",
      "get",
      "400",
      undefined
    );
    expect(result).toBe(false);
  });
  it("Should return false if path method does not have response with requested status", () => {
    const result = getExample(
      {
        definition: {
          paths: { "/endpoint": { get: { responses: { "200": {} } } } },
        },
      },
      "/endpoint",
      "get",
      "400",
      undefined
    );
    expect(result).toBe(false);
  });
  it("Should return false if path method response does not have content", () => {
    const result = getExample(
      {
        definition: {
          paths: { "/endpoint": { get: { responses: { "400": {} } } } },
        },
      },
      "/endpoint",
      "get",
      "400",
      undefined
    );
    expect(result).toBe(false);
  });
  it("Should return false if path method response does not have application/json content", () => {
    const result = getExample(
      {
        definition: {
          paths: {
            "/endpoint": {
              get: { responses: { "400": { content: { "text/html": {} } } } },
            },
          },
        },
      },
      "/endpoint",
      "get",
      "400",
      undefined
    );
    expect(result).toBe(false);
  });
  it("Should return requested example if a specific example is requested", () => {
    const result = getExample(
      {
        definition: {
          paths: {
            "/endpoint": {
              get: {
                responses: {
                  "400": {
                    content: {
                      "application/json": {
                        examples: {
                          "my-example": { value: { hello: "world" } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/endpoint",
      "get",
      "400",
      "my-example"
    );
    expect(result).toEqual({ hello: "world" });
  });

  it("Should return first example if no specific example is requested", () => {
    const result = getExample(
      {
        definition: {
          paths: {
            "/endpoint": {
              get: {
                responses: {
                  "400": {
                    content: {
                      "application/json": {
                        examples: {
                          "my-other-example": { value: { hello: "universe" } },
                          "my-example": { value: { hello: "world" } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/endpoint",
      "get",
      "400",
      undefined
    );
    expect(result).toEqual({ hello: "universe" });
  });
});
