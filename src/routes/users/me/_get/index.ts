/** OPENAPI-ROUTE: get-users-me */
import { Context } from "openapi-backend";
import * as db from "../../../../features/db";
import { getGravatar } from "../../utils";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;

  res.status_code = 200;

  //Get User Profile (wp_appq_evd_profile)
  let profileData = await getProfile(user.profile_id);

  if (user.role === "customer" && user.tryber_wp_user_id) {
    // Is customer
    try {
      // Get workspaces for current customer
      const workspacesSql =
        "SELECT c.* FROM wp_appq_customer c JOIN wp_appq_user_to_customer utc ON (c.id = utc.customer_id) WHERE utc.wp_user_id = ?";
      let workspaces = await db.query(
        db.format(workspacesSql, [user.tryber_wp_user_id]),
        "tryber"
      );

      setWorkspaces(user, workspaces);
    } catch (error) {
      console.log(error);
      return error as Error;
    }
  } else {
    // Is admin
    try {
      // Get all workspaces
      const workspacesSql = "SELECT * FROM wp_appq_customer c";
      let workspaces = await db.query(workspacesSql, "tryber");
      setWorkspaces(user, workspaces);
    } catch (error) {
      console.log(error);
      return error as Error;
    }
  }

  return formattedUser(user, profileData);
};

const getProfile = async (profile_id: number | undefined): Promise<any> => {
  const emptyProfile = { name: "name", surname: "surname" };

  if (profile_id) {
    const profileSql = "SELECT * FROM wp_appq_evd_profile WHERE id = ?";
    let profile = await db.query(db.format(profileSql, [profile_id]), "tryber");

    return profile ? profile[0] : emptyProfile;
  }

  return emptyProfile;
};

const setWorkspaces = (user: UserType, workspaces: Array<object>) => {
  user.workspaces = [];

  if (workspaces.length) {
    workspaces.forEach((workspace: any) => {
      user.workspaces.push({
        id: workspace.id,
        company: workspace.company,
        logo: workspace.company_logo || "",
        tokens: workspace.tokens,
      });
    });
  }
};

const formattedUser = async (user: any, profile: any): Promise<any> => {
  const picUrl = await getGravatar(user.email);
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    profile_id: user.profile_id,
    tryber_wp_user_id: user.tryber_wp_user_id,
    name: profile.name + " " + profile.surname,
    workspaces: user.workspaces,
    ...(picUrl && { picture: picUrl }),
  };
};
