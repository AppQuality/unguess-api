import { getBugDevice } from "./index";

const desktop_1 = {
  form_factor: "desktop",
  pc_type: "Desktop",
  os: "Windows",
  os_version: "10",
  type: "desktop",
};

const weird_device = {
  form_factor: "smart speaker",
  pc_type: "Desktop",
  os: "Windows",
  os_version: "10",
  manufacturer: "Samsung",
  model: "Galaxy S20",
};

const notebook = {
  ...desktop_1,
  pc_type: "Notebook",
};
const gaming_pc = {
  ...desktop_1,
  pc_type: "Gaming PC",
};
const tablet_pc = {
  ...desktop_1,
  pc_type: "Tablet PC / Hybrid",
};
const ultrabook = {
  ...desktop_1,
  pc_type: "Ultrabook",
};

const phone = {
  form_factor: "smartphone",
  os: "Android",
  os_version: "10",
  manufacturer: "Samsung",
  model: "Galaxy S20",
  type: "smartphone",
  pc_type: "",
};

const tablet = {
  form_factor: "tablet",
  os: "Android",
  os_version: "10",
  manufacturer: "Samsung",
  model: "Galaxy Tab S7",
  type: "tablet",
  pc_type: "",
};

describe("getBugDevice", () => {
  // Should return completed if status_id is 2, regardless of start_date
  it("should return a desktop if the device is unknown", () => {
    const response = getBugDevice(weird_device);
    expect(response.type).toBe("desktop");
  });

  it("should recognize notebook", () => {
    const response = getBugDevice(
      notebook
    ) as StoplightComponents["schemas"]["Desktop"];
    expect(response.desktop_type).toBe("Notebook");
    expect(response.os).toBe(notebook.os);
    expect(response.os_version).toBe(notebook.os_version);
  });

  it("should recognize gaming pc", () => {
    const response = getBugDevice(
      gaming_pc
    ) as StoplightComponents["schemas"]["Desktop"];
    expect(response.desktop_type).toBe("Gaming PC");
    expect(response.os).toBe(gaming_pc.os);
    expect(response.os_version).toBe(gaming_pc.os_version);
  });

  it("should recognize tablet pc", () => {
    const response = getBugDevice(
      tablet_pc
    ) as StoplightComponents["schemas"]["Desktop"];
    expect(response.desktop_type).toBe("Tablet PC / Hybrid");
    expect(response.os).toBe(tablet_pc.os);
    expect(response.os_version).toBe(tablet_pc.os_version);
  });

  it("should recognize ultrabook", () => {
    const response = getBugDevice(
      ultrabook
    ) as StoplightComponents["schemas"]["Desktop"];
    expect(response.desktop_type).toBe("Ultrabook");
    expect(response.os).toBe(ultrabook.os);
    expect(response.os_version).toBe(ultrabook.os_version);
  });

  it("should recognize smartphone", () => {
    const response = getBugDevice(
      phone
    ) as StoplightComponents["schemas"]["Smartphone"];
    expect(response.os).toBe(phone.os);
    expect(response.os_version).toBe(phone.os_version);
    expect(response.manufacturer).toBe(phone.manufacturer);
    expect(response.model).toBe(phone.model);
  });

  it("should recognize tablet", () => {
    const response = getBugDevice(
      tablet
    ) as StoplightComponents["schemas"]["Tablet"];

    expect(response.os).toBe(tablet.os);
    expect(response.os_version).toBe(tablet.os_version);
    expect(response.manufacturer).toBe(tablet.manufacturer);
    expect(response.model).toBe(tablet.model);
  });
});
