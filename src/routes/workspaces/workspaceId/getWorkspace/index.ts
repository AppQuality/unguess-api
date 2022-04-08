import * as db from "@src/features/db";

export default async (
  workspaceId: number,
  user: UserType
): Promise<Workspace | {}> => {
  try {
    // Check parameters
    if (workspaceId == null || workspaceId <= 0) {
      throw Error("Bad request");
    }

    if (user.id == null || user.id <= 0) {
      throw Error("Bad request");
    }

    // Check if workspace exists
    const customerSql = db.format(
      `SELECT c.* 
      FROM wp_appq_customer c
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
          [user.id, workspaceId]
        );

        let userToCustomer = await db.query(userToCustomerSql);

        if (userToCustomer.length) {
          userToCustomer = userToCustomer[0];
        } else {
          throw Error("You have no permission to get this workspace");
        }
      }

      return {
        id: workspace.id,
        company: workspace.company,
        logo: workspace.company_logo,
        tokens: workspace.tokens,
      } as StoplightComponents["schemas"]["Workspace"];
    }

    throw Error("No workspace found");
  } catch (error) {
    throw error;
  }
};
