/** OPENAPI-CLASS: get-campaigns-cid-devices */
import CampaignRoute from "@src/features/routes/CampaignRoute";
import * as db from "@src/features/db";
import { getBugDevice } from "@src/utils/bugs/getBugDevice";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-devices"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-devices"]["parameters"]["path"];
}> {
  protected async prepare() {
    const devices = await this.getBugDevices();
    this.setSuccess(200, this.formatBugDevices(devices));
  }

  private async getBugDevices() {
    const devices: {
      form_factor: string;
      manufacturer: string;
      model: string;
      pc_type: string;
    }[] = await db.query(
      db.format(
        `
          SELECT device.form_factor, bug.manufacturer, bug.model, device.pc_type
      FROM wp_appq_evd_bug bug
              JOIN wp_crowd_appq_device device ON (bug.dev_id = device.id)
              JOIN wp_appq_evd_bug_status bstatus ON (bug.status_id = bstatus.id)
      WHERE campaign_id = ?
      AND bug.publish = 1
      AND ${
        this.shouldShowNeedReview()
          ? `(bstatus.name = 'Approved' OR bstatus.name = 'Need Review')`
          : `bstatus.name = 'Approved'`
      }
      GROUP BY (bug.dev_id);
      `,
        [this.cp_id]
      )
    );

    return devices;
  }

  private formatBugDevices(
    devices: Awaited<ReturnType<typeof this.getBugDevices>>
  ) {
    const deviceList = devices.map((d) => {
      const device = getBugDevice(d);
      return device.type === "desktop"
        ? device.desktop_type
        : `${device.manufacturer} ${device.model}`;
    });

    return [...new Set(deviceList)].map((d) => ({
      device: d,
    }));
  }
}
