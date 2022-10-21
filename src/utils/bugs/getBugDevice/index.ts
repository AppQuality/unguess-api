import { ERROR_MESSAGE } from "@src/utils/constants";
import { BugsParams } from "@src/__mocks__/database/bugs";

export const getBugDevice = async (
  bug: BugsParams & { form_factor: string; pc_type: string }
): Promise<
  | StoplightComponents["schemas"]["Smartphone"]
  | StoplightComponents["schemas"]["Tablet"]
  | StoplightComponents["schemas"]["Desktop"]
> => {
  const error = {
    code: 500,
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  // Check if bug exists
  if (!bug) {
    throw { ...error, message: "GET_BUG_DEVICE_ERROR: invalid bug" };
  }

  console.log(bug.form_factor);

  switch (bug.form_factor.toLocaleLowerCase()) {
    case "smartphone":
      return getSmartphone(bug);
    case "tablet":
      return getTablet(bug);
    case "desktop":
      return getDesktop(bug);
    default:
      return getGenericDevice(bug);
  }
};

const getSmartphone = (
  bug: BugsParams & { form_factor: string; pc_type: string }
): StoplightComponents["schemas"]["Smartphone"] => ({
  manufacturer: bug.manufacturer || "-",
  model: bug.model || "-",
  os: bug.os || "-",
  os_version: bug.os_version || "-",
  type: "smartphone",
});

const getTablet = (
  bug: BugsParams & { form_factor: string; pc_type: string }
): StoplightComponents["schemas"]["Tablet"] => ({
  manufacturer: bug.manufacturer || "-",
  model: bug.model || "-",
  os: bug.os || "-",
  os_version: bug.os_version || "-",
  type: "tablet",
});

const getDesktop = (
  bug: BugsParams & { form_factor: string; pc_type: string }
): StoplightComponents["schemas"]["Desktop"] => ({
  desktop_type: (bug.pc_type ||
    "Desktop") as StoplightComponents["schemas"]["Desktop"]["desktop_type"],
  os: bug.os || "-",
  os_version: bug.os_version || "-",
  type: "desktop",
});

const getGenericDevice = (
  bug: BugsParams & { form_factor: string; pc_type: string }
):
  | StoplightComponents["schemas"]["Desktop"]
  | StoplightComponents["schemas"]["Smartphone"]
  | StoplightComponents["schemas"]["Tablet"] => ({
  desktop_type: (bug.pc_type ||
    "Desktop") as StoplightComponents["schemas"]["Desktop"]["desktop_type"],
  os: bug.os || "-",
  os_version: bug.os_version || "-",
  type: "desktop",
});
