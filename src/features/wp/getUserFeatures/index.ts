import { unguess } from "@src/features/database";

export default async (unguess_user_id: number) => {
  const results = await unguess.tables.WpUgFeatures.do()
    .select("id", "slug", "display_name")
    .join(
      "wp_ug_user_to_feature",
      "wp_ug_user_to_feature.feature_id",
      "wp_ug_features.id"
    )
    .where("wp_ug_user_to_feature.unguess_wp_user_id", unguess_user_id);

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
