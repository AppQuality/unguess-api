/** OPENAPI-CLASS: post-video-vid-observations */

import { tryber } from "@src/features/database";
import VideoRoute from "@src/features/routes/VideoRoute";

export default class GetVideoTags extends VideoRoute<{
  response: StoplightOperations["post-video-vid-observations"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["post-video-vid-observations"]["parameters"]["path"];
  body: StoplightOperations["post-video-vid-observations"]["requestBody"]["content"]["application/json"];
}> {
  protected async filter() {
    const body = this.getBody();
    if (!(await super.filter())) return false;

    return true;
  }

  protected async prepare(): Promise<void> {
    const id = await this.insertNewObservation();
    return this.setSuccess(200, {
      ...(await this.getObservation(id)),
      tags: [],
    });
  }

  private async insertNewObservation() {
    const body = this.getBody();

    const insert = await tryber.tables.WpAppqUsecaseMediaObservations.do()
      .insert({
        name: "",
        description: "",
        ux_note: "",
        video_ts: body.start,
        video_ts_end: body.end,
        media_id: this.video_id,
      })
      .returning("id");
    if (!insert) {
      this.setError(500, {
        code: 500,
        message: "Failed to insert observation",
      } as OpenapiError);
      throw new Error("Failed to insert observation");
    }
    return insert[0].id;
  }

  private async getObservation(id: number) {
    const observation = await tryber.tables.WpAppqUsecaseMediaObservations.do()
      .select(
        tryber.ref("id").withSchema("wp_appq_usecase_media_observations"),
        tryber
          .ref("name")
          .withSchema("wp_appq_usecase_media_observations")
          .as("title"),
        tryber
          .ref("description")
          .withSchema("wp_appq_usecase_media_observations"),
        tryber
          .ref("video_ts")
          .withSchema("wp_appq_usecase_media_observations")
          .as("start"),
        tryber
          .ref("video_ts_end")
          .withSchema("wp_appq_usecase_media_observations")
          .as("end")
      )
      .where("id", id)
      .first();
    if (!observation) {
      this.setError(404, {
        code: 404,
        message: "Observation not found",
      } as OpenapiError);
      throw new Error("Observation not found");
    }

    return {
      id: observation.id,
      title: observation.title,
      description: observation.description,
      start: observation.start,
      end: observation.end,
    };
  }
}
