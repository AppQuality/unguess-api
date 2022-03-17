/** OPENAPI-ROUTE: get-users-me */
import { Context } from "openapi-backend";
import * as db from "../../../../features/db";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;

  res.status_code = 200;

  if (user.profile_id && user.tryber_wp_user_id) {
    // Is customer

    try {
      // Get customer name
      const profileSql = "SELECT * FROM wp_appq_evd_profile WHERE id = ?";
      let profile = await db.query(
        db.format(profileSql, [user.profile_id]),
        "tryber"
      );

      profile = profile[0];

      // Get workspaces for current customer
      const workspacesSql =
        "SELECT * FROM wp_appq_customer c JOIN wp_appq_user_to_customer utc ON (c.id = utc.customer_id) WHERE utc.wp_user_id = ?";
      let workspaces = await db.query(
        db.format(workspacesSql, [user.tryber_wp_user_id]),
        "tryber"
      );

      let workspaces_data: any = [];
      workspaces.forEach((workspace: any) => {
        let workspace_data: any = {};
        workspace_data.id = workspace.id;
        workspace_data.company = workspace.company;
        workspace_data.logo = workspace.company_logo;
        workspace_data.tokens = workspace.tokens;
        workspaces_data.push(workspace_data);
      });

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        profile_id: user.profile_id,
        tryber_wp_user_id: user.tryber_wp_user_id,
        name: profile.name + " " + profile.surname,
        workspaces: workspaces_data,
      };
    } catch (error) {
      console.error(error);
    }
  } else {
    // Is admin

    // Get all workspaces
    const workspacesSql = "SELECT * FROM wp_appq_customer c";
    let workspaces = await db.query(workspacesSql, "tryber");

    let workspaces_data: any = [];
    workspaces.forEach((workspace: any) => {
      let workspace_data: any = {};
      workspace_data.id = workspace.id;
      workspace_data.company = workspace.company;
      workspace_data.logo = workspace.company_logo;
      workspace_data.tokens = workspace.tokens;
      workspaces_data.push(workspace_data);
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: "Name Surname",
      workspaces: workspaces_data,
    };
  }
};
