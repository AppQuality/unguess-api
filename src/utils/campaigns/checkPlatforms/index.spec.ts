import { checkPlatforms } from "./index";
import {
  table as platformTable,
  data as platformData,
} from "@src/__mocks__/database/platforms";
import { DT_DESKTOP, DT_SMARTPHONE } from "@src/utils/constants";

const AndroidPhone = {
  id: 1,
  name: "Android",
  form_factor: DT_SMARTPHONE,
};

const iOSPhone = {
  id: 2,
  name: "iOS",
  form_factor: DT_SMARTPHONE,
};
const WindowsPC = {
  id: 8,
  name: "Windows",
  form_factor: DT_DESKTOP,
};

describe("checkPlatforms", () => {
  beforeAll(async () => {
    await platformData.addItem(AndroidPhone);
    await platformData.addItem(iOSPhone);
    await platformData.addItem(WindowsPC);
  });

  it("should return false if the platform doesn't exists", async () => {
    const response = await checkPlatforms([
      { id: AndroidPhone.id, deviceType: WindowsPC.form_factor },
    ]);

    expect(response).toBeFalsy();
  });

  it("should return true if the platform exists", async () => {
    const response = await checkPlatforms([
      { id: AndroidPhone.id, deviceType: AndroidPhone.form_factor },
      { id: iOSPhone.id, deviceType: iOSPhone.form_factor },
      { id: WindowsPC.id, deviceType: WindowsPC.form_factor },
    ]);

    expect(response).toBeTruthy();
  });
});
