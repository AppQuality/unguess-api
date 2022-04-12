import * as db from "@src/features/db";
import { getGravatar } from "@src/routes/users/utils";

const fallBackCsmProfile = {
  id: 20739,
  name: "Gianluca",
  surname: "Peretti",
  email: "gianluca.peretti@unguess.io",
  role: "admin",
  workspaces: [],
};

const loadCsmData = async (
  csm: StoplightComponents["schemas"]["Workspace"]["csm"]
) => {
  let profilePic = await getGravatar(csm.email);
  if (profilePic) csm.picture = profilePic;

  return csm;
};

export default async (
  workspaceId: number,
  user: UserType
): Promise<Workspace | {}> => {
  try {
    // Check parameters
    if (workspaceId == null || workspaceId <= 0) {
      throw Error("Bad request");
    }

    if (user.role !== "administrator") {
      if (user.id == null || user.id <= 0) {
        throw Error("Bad request");
      }
    }

    // Check if workspace exists
    const customerSql = db.format(
      `SELECT c.*, p.name as csmName, p.surname as csmSurname, p.email as csmEmail
      FROM wp_appq_customer c
        LEFT JOIN wp_appq_evd_profile p ON (p.id = c.pm_id)
      WHERE c.id = ?`,
      [workspaceId]
    );

    let workspace = await db.query(customerSql);

    if (workspace.length) {
      workspace = workspace[0];

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
          throw Error("You have no permission to get this workspace");
        }
      }

      //Add CSM info

      let rawCsm = workspace.pm_id
        ? {
            id: workspace.pm_id,
            name: workspace.csmName + " " + workspace.csmSurname,
            email: workspace.csmEmail,
            role: "admin",
            workspaces: [],
          }
        : fallBackCsmProfile;

      let csm = await loadCsmData(rawCsm);

      return {
        id: workspace.id,
        company: workspace.company,
        logo: workspace.company_logo,
        tokens: workspace.tokens,
        csm: csm,
      } as StoplightComponents["schemas"]["Workspace"];
    }

    throw Error("No workspace found");
  } catch (error) {
    throw error;
  }
};
