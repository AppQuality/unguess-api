/** OPENAPI-CLASS: get-campaigns-cid-clusters */

import { tryber } from "@src/features/database";
import CampaignRoute from "@src/features/routes/CampaignRoute";
export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-clusters"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-clusters"]["parameters"]["path"];
}> {
  protected async prepare(): Promise<void> {
    return this.setSuccess(200, {
      items: await this.getClusters(),
    });
  }

  private async getClusters() {
    const clusters = await tryber.tables.WpAppqUsecaseCluster.do()
      .select(
        tryber.ref("id").withSchema("wp_appq_usecase_cluster"),
        tryber.ref("title").withSchema("wp_appq_usecase_cluster").as("name")
      )
      .where("wp_appq_usecase_cluster.campaign_id", this.cp_id);
    if (clusters === undefined) return [];
    return clusters.map((cluster) => ({
      id: cluster.id,
      name: cluster.name,
    }));
  }
}
