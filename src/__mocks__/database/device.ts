import Table from "./tryber_table";

type DeviceParams = {
  id?: number;
  manufacturer?: string;
  model?: string;
  network?: string;
  platform_id?: number;
  id_profile?: number;
  os_version?: string;
  os_version_id?: number;
  operating_system?: string;
  enabled?: number;
  form_factor?: string;
  pc_type?: string;
  architecture?: string;
  source_id?: number;
  creation_time?: string;
  update_time?: string;
};

const defaultItem: DeviceParams = {
  manufacturer: "???",
  model: "???",
  network: "???",
  form_factor: "Smartphone",
  enabled: 1,
};
class Devices extends Table<DeviceParams> {
  protected name = "wp_crowd_appq_device";
  protected columns = [
    "id INTEGER PRIMARY KEY NOT NULL",
    "manufacturer VARCHAR(300)",
    "model VARCHAR(300)",
    "network VARCHAR(45)",
    "platform_id INTEGER",
    "id_profile INTEGER",
    "os_version VARCHAR(45)",
    "os_version_id INTEGER",
    "operating_system VARCHAR(45)",
    "enabled INTEGER DEFAULT 1",
    "form_factor VARCHAR(45)",
    "pc_type VARCHAR(45)",
    "architecture INTEGER",
    "source_id INTEGER",
    "creation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    "update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
  ];
  constructor() {
    super(defaultItem);
  }
}
const devices = new Devices();
export default devices;
export type { DeviceParams };
