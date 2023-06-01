import { unguess, tryber } from "@src/features/database";

jest.mock("@appquality/wp-auth");
jest.mock("@src/features/database");

jest.mock("@src/features/db", () => ({
  ...jest.requireActual("@src/features/db"),
  query: async (query: string, dbName: string = ""): Promise<any> => {
    const db = dbName == "unguess" ? unguess : tryber;
    return await db.raw(query);
  },
}));

export {};
