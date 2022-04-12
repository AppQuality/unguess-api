/** OPENAPI-ROUTE: get-users-me */
import { Context } from "openapi-backend";
import * as db from "../../../../features/db";
import { getGravatar } from "../../utils";
import getUserWorkspaces from "@src/routes/workspaces/getUserWorkspaces";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;

  res.status_code = 200;

  //Get User Profile (wp_appq_evd_profile)
  let profileData = await getProfile(user.profile_id);

  let userWorkspaces = await getUserWorkspaces(user, 1, 1); //TODO FIX REAL PAGINANTION
  setWorkspaces(user, userWorkspaces.workspaces);

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
        csm: workspace.csm,
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
