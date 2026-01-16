import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('class_types', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 100).notNullable();
    table.string('name_fr', 100);
    table.string('name_es', 100);
    table.text('description');
    table.text('description_fr');
    table.text('description_es');
    table.integer('duration_minutes').notNullable();
    table.integer('max_capacity').notNullable();
    table.enu('difficulty_level', ['beginner', 'intermediate', 'advanced']);
    table.decimal('price', 10, 2).notNullable();
    table.text('image_url');
    table.specificType('equipment_needed', 'text[]').defaultTo('{}');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('is_active');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('class_types');
}