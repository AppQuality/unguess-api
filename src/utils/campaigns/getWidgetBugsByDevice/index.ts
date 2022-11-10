import * as db from "@src/features/db";
import { getBugDevice } from "@src/utils/bugs/getBugDevice";
import { BugsParams } from "@src/__mocks__/database/bugs";

type device =
  | StoplightComponents["schemas"]["Desktop"]
  | StoplightComponents["schemas"]["Smartphone"]
  | StoplightComponents["schemas"]["Tablet"];

type deviceFromBug = device & { deviceKey: string };
type widgetDataType = device & { bugs: number };

export const getWidgetBugsByDevice = async (
  campaign: StoplightComponents["schemas"]["CampaignWithOutput"] & {
    showNeedReview: boolean;
  }
): Promise<StoplightComponents["schemas"]["WidgetBugsByDevice"]> => {
  const error = {
    code: 400,
    message: "Something went wrong with bugs-by-device widget",
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  // Widget requires bugs output
  if (!campaign.outputs || !campaign.outputs.includes("bugs")) {
    throw error;
  }

  const query = `SELECT b.id,
    b.internal_id,
    b.campaign_id,
    b.message     as title,
    b.description,
    b.expected_result,
    b.current_result,
    b.status_id,
    b.created,
    b.updated,
    b.note,
    device.form_factor,
    device.pc_type,
    b.manufacturer,
    b.model,
    b.os,
    b.os_version,
    b.application_section,
    b.application_section_id,
    b.is_duplicated,
    b.duplicated_of_id,
    b.is_favorite,
    b.bug_replicability_id,
    b.bug_type_id,
    b.severity_id
    from wp_appq_evd_bug b
      LEFT JOIN wp_crowd_appq_device device ON (b.dev_id = device.id)
    WHERE b.campaign_id = ?
    AAND ${
      campaign.showNeedReview
        ? `(status.name == 'Approved' OR status.name == 'Need Review')`
        : `status.name == 'Approved'`
    }`;

  const bugs = await db.query(db.format(query, [campaign.id]));

  if (!bugs) {
    throw {
      ...error,
      code: 401,
      message: "No bugs found for this campaign",
    };
  }

  const devices: Array<deviceFromBug> = bugs.map(
    (bug: BugsParams & { form_factor: string; pc_type: string }) => {
      const device = getBugDevice(bug);
      return {
        ...device,
        deviceKey: Object.values(device).join(""), // Used to group devices
      };
    }
  );

  // Group by device by deviceKey
  const groupedDevices = devices.reduce(
    (
      acc: {
        [key: string]: widgetDataType;
      },
      { deviceKey, ...device }: deviceFromBug
    ) => {
      const key: string = deviceKey;
      if (!acc[key]) {
        acc[key] = {
          ...device,
          bugs: 0,
        };
      }

      acc[key].bugs += 1;

      return acc;
    },
    {}
  );

  const data: Array<widgetDataType> = Object.values(groupedDevices).sort(
    (a, b) => b.bugs - a.bugs
  );

  return {
    data: data,
    kind: "bugsByDevice",
  } as StoplightComponents["schemas"]["WidgetBugsByDevice"];
};
