import notImplemented from ".";
describe("Not Implemented", () => {
  it("should return a not implemented error", async () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    // @ts-ignore
    const middleware = notImplemented({
      // @ts-ignore
      mockResponseForOperation: (operation) => ({
        status: 501,
        mock: {
          message: "Not Implemented",
        },
      }),
    });
    // @ts-ignore
    middleware({ operation: { operationId: "" } }, {}, { status });
    expect(json).toBeCalledTimes(1);
    expect(json).toBeCalledWith({ message: "Not Implemented" });
    expect(status).toBeCalledTimes(1);
    expect(status).toBeCalledWith(501);
  });
});
