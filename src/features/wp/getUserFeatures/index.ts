import * as db from "@src/features/db";

export default async (unguess_user_id: number) => {
  const sql = `SELECT f.id, f.slug, f.display_name from wp_ug_features f
  JOIN wp_ug_user_to_feature utf on f.id = utf.feature_id
  WHERE utf.unguess_wp_user_id = ?`;

  const results = await db.query(db.format(sql, [unguess_user_id]), "unguess");
  if (results.length) {
    return results.map((feature: any) => {
      return {
        slug: feature.slug,
        name: feature.display_name,
      };
    });
  } else {
    return [];
  }
};
