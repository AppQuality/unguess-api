import PHPUnserialize from 'php-unserialize';

import * as db from '../../db';

export default async (userData: {
  testerId: number;
  ID: number;
  user_login: string;
  user_pass: string;
}): Promise<UserType | Error> => {
  let user: UserType = {
    ...userData,
    capabilities: [],
    permission: {},
    role: "tester",
  };

  try {
    const userRolesSql =
      'SELECT option_value from wp_options where option_name = "wp_user_roles"';
    let results = await db.query(userRolesSql);
    let roles = PHPUnserialize.unserialize(results[0].option_value);
    const userMetaSql =
      'SELECT meta_value from wp_usermeta where meta_key = "wp_capabilities" and user_id = ?';
    let userMetaResults = await db.query(db.format(userMetaSql, [user.ID]));
    let permissions = [];
    if (userMetaResults.length) {
      permissions = PHPUnserialize.unserialize(userMetaResults[0].meta_value);
    }
    user.role = "tester";
    user.capabilities = [];

    if (permissions) {
      Object.keys(permissions).forEach((permission) => {
        if (roles.hasOwnProperty(permission)) {
          user.capabilities = user.capabilities.concat(
            Object.keys(roles[permission].capabilities)
          );
          if (user.role == "tester") {
            user.role = permission;
          }
        } else {
          user.capabilities.push(permission);
        }
      });
    }
  } catch (e) {
    return e as Error;
  }

  const permissions: { [key: string]: boolean | string[] } = {};
  user.capabilities.forEach((cap) => {
    if (cap.endsWith("_full_access")) {
      permissions[cap.replace("_full_access", "")] = true;
    }
  });

  try {
    const sql =
      "SELECT main_id,type from wp_appq_olp_permissions where wp_user_id = ?";
    const results = await db.query(db.format(sql, [user.ID]));
    results.forEach((item: { type: string; main_id: string }) => {
      if (!permissions.hasOwnProperty(item.type)) {
        permissions[item.type] = [];
      }
      let permission = permissions[item.type];
      if (Array.isArray(permission)) {
        permission.push(item.main_id);
        permissions[item.type] = permission;
      }
    });

    if (!user.hasOwnProperty("permission")) {
      user.permission = {};
    }
    if (!user.permission.hasOwnProperty("admin")) {
      user.permission.admin = {};
    }
    user.permission.admin = permissions;
  } catch (e) {
    return e as Error;
  }

  return user;
};
