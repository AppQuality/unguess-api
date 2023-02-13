import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("wp_revslider_css");
  await knex.schema.dropTableIfExists("wp_revslider_layer_animations");
  await knex.schema.dropTableIfExists("wp_revslider_navigations");
  await knex.schema.dropTableIfExists("wp_revslider_sliders");
  await knex.schema.dropTableIfExists("wp_revslider_slides");
  await knex.schema.dropTableIfExists("wp_revslider_static_slides");
  await knex.schema.dropTableIfExists("wp_revslider_css_bkp");
  await knex.schema.dropTableIfExists("wp_revslider_layer_animations_bkp");
  await knex.schema.dropTableIfExists("wp_revslider_navigations_bkp");
  await knex.schema.dropTableIfExists("wp_revslider_sliders_bkp");
  await knex.schema.dropTableIfExists("wp_revslider_slides_bkp");
  await knex.schema.dropTableIfExists("wp_revslider_static_slides_bkp");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable("wp_revslider_css", function (table) {
    table.increments("id").notNullable();
    table.string("handle").notNullable();
    table.string("settings");
    table.string("hover");
    table.string("params").notNullable();
    table.string("advanced");
    table.unique(["id"]);
  });
  await knex.schema.createTable("wp_revslider_css_bkp", function (table) {
    table.increments("id").notNullable();
    table.string("handle").notNullable();
    table.string("settings");
    table.string("hover");
    table.string("params").notNullable();
    table.string("advanced");
    table.unique(["id"]);
  });
  await knex.schema.createTable(
    "wp_revslider_layer_animations",
    function (table) {
      table.increments("id").notNullable();
      table.string("handle").notNullable();
      table.string("params").notNullable();
      table.string("settings");
      table.unique(["id"]);
    }
  );
  await knex.schema.createTable(
    "wp_revslider_layer_animations_bkp",
    function (table) {
      table.increments("id").notNullable();
      table.string("handle").notNullable();
      table.string("params").notNullable();
      table.string("settings");
      table.unique(["id"]);
    }
  );
  await knex.schema.createTable("wp_revslider_navigations", function (table) {
    table.increments("id").notNullable();
    table.string("name").notNullable();
    table.string("handle").notNullable();
    table.string("css").notNullable();
    table.string("markup").notNullable();
    table.string("settings");
    table.string("type").notNullable();
    table.unique(["id"]);
  });
  await knex.schema.createTable(
    "wp_revslider_navigations_bkp",
    function (table) {
      table.increments("id").notNullable();
      table.string("name").notNullable();
      table.string("handle").notNullable();
      table.string("css").notNullable();
      table.string("markup").notNullable();
      table.string("settings");
      table.unique(["id"]);
    }
  );
  await knex.schema.createTable("wp_revslider_sliders", function (table) {
    table.increments("id").notNullable();
    table.string("title").notNullable();
    table.string("alias");
    table.string("params").notNullable();
    table.string("settings");
    table.string("type").notNullable().defaultTo("");
    table.unique(["id"]);
  });
  await knex.schema.createTable("wp_revslider_sliders_bkp", function (table) {
    table.increments("id").notNullable();
    table.string("title").notNullable();
    table.string("alias");
    table.string("params").notNullable();
    table.string("settings");
    table.string("type").notNullable().defaultTo("");
    table.unique(["id"]);
  });
  await knex.schema.createTable("wp_revslider_slides", function (table) {
    table.increments("id").notNullable();
    table.integer("slider_id").notNullable();
    table.integer("slide_order").notNullable();
    table.string("params").notNullable();
    table.string("layers").notNullable();
    table.string("settings").notNullable();
    table.unique(["id"]);
  });
  await knex.schema.createTable("wp_revslider_slides_bkp", function (table) {
    table.increments("id").notNullable();
    table.integer("slider_id").notNullable();
    table.integer("slide_order").notNullable();
    table.string("params").notNullable();
    table.string("layers").notNullable();
    table.string("settings").notNullable();
    table.unique(["id"]);
  });
  await knex.schema.createTable("wp_revslider_static_slides", function (table) {
    table.increments("id").notNullable();
    table.integer("slider_id").notNullable();
    table.string("params").notNullable();
    table.string("layers").notNullable();
    table.string("settings").notNullable();
    table.unique(["id"]);
  });

  await knex.schema.createTable(
    "wp_revslider_static_slides_bkp",
    function (table) {
      table.increments("id").notNullable();
      table.integer("slider_id").notNullable();
      table.string("params").notNullable();
      table.string("layers").notNullable();
      table.string("settings").notNullable();
      table.unique(["id"]);
    }
  );
}
