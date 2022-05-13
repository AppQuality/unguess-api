import * as db from "@src/features/db";

export default async (
  platforms: StoplightComponents["requestBodies"]["Campaign"]["content"]["application/json"]["platforms"]
): Promise<boolean> => {
  // Check request
  if (!Array.isArray(platforms)) return false;

  // Check for each platform if os exists
  let platformExists = true;
  for (let platform of platforms) {
    let os_id = platform.id;
    let form_factor_id = platform.deviceType;

    const platformSql = db.format(
      `SELECT p.* 
      FROM wp_appq_evd_platform p
      WHERE p.id = ? 
      AND p.form_factor = ?`,
      [os_id, form_factor_id]
    );

    let platformResult = await db.query(platformSql);

    if (!platformResult.length) {
      console.debug("Platform not found");
      platformExists = false;
      break;
    }
  }

  return platformExists;
};
