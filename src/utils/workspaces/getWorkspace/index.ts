import * as db from "@src/features/db";
import { getGravatar } from "@src/utils/users";
import { ERROR_MESSAGE, fallBackCsmProfile } from "@src/utils/constants";
import { getWorkspaceCoins } from "../getWorkspaceCoins";
import { getTotalCoins } from "../getTotalCoins";

const loadCsmData = async (
  csm: StoplightComponents["schemas"]["Workspace"]["csm"]
) => {
  let profilePic = await getGravatar(csm.email);
  if (profilePic) csm.picture = profilePic;

  return csm;
};

interface GetWorkspacesArgs {
  user: UserType;
  workspaceId?: number;
}

export const getWorkspace = async ({
  workspaceId,
  user,
}: GetWorkspacesArgs): Promise<StoplightComponents["schemas"]["Workspace"]> => {
  let error = {
    message: ERROR_MESSAGE + " with workspace",
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  // Check parameters
  if (workspaceId == null || workspaceId <= 0) throw { ...error, code: 400 };

  if (user.role !== "administrator")
    if (user.id == null || user.id <= 0) throw { ...error, code: 400 };

  // Check if workspace exists
  const customerSql = db.format(
    `SELECT c.*, p.name as csmName, p.surname as csmSurname, p.email as csmEmail, p.id as csmProfileId, p.wp_user_id as csmTryberWpUserId, u.user_url as csmUserUrl
      FROM wp_appq_customer c
      LEFT JOIN wp_appq_evd_profile p ON (p.id = c.pm_id)
      LEFT JOIN wp_users u ON (u.ID = p.wp_user_id)
      WHERE c.id = ?`,
    [workspaceId]
  );

  let workspace = await db.query(customerSql);

  if (workspace.length) {
    workspace = workspace[0] as StoplightComponents["schemas"]["Workspace"];

    if (user.role !== "administrator") {
      // Check if user has permission to get the customer
      const userToCustomerSql = db.format(
        `SELECT * FROM wp_appq_user_to_customer WHERE wp_user_id = ? AND customer_id = ?`,
        [user.tryber_wp_user_id || 0, workspaceId]
      );

      let userToCustomer = await db.query(userToCustomerSql);

      if (userToCustomer.length) {
        userToCustomer = userToCustomer[0];
      } else {
        throw { ...error, message: "workspace issue", code: 403 };
      }
    }

    //Add CSM info

    let rawCsm = workspace.pm_id
      ? {
          id: workspace.pm_id,
          name: workspace.csmName + " " + workspace.csmSurname,
          email: workspace.csmEmail,
          profile_id: workspace.csmProfileId,
          tryber_wp_user_id: workspace.csmTryberWpUserId,
          ...(workspace.csmUserUrl && { url: workspace.csmUserUrl }),
        }
      : fallBackCsmProfile;

    let csm = await loadCsmData(rawCsm);

    // Get workspace's express coins
    const coins = await getWorkspaceCoins({ workspaceId });

    // Get total coins amount
    const totalCoins = await getTotalCoins(coins);

    return {
      id: workspace.id,
      company: workspace.company,
      tokens: workspace.tokens,
      ...(workspace.company_logo && { logo: workspace.company_logo }),
      csm: csm,
      coins: totalCoins,
    } as StoplightComponents["schemas"]["Workspace"];
  }

  throw { ...error, message: "generic workspace error", code: 403 };
};
