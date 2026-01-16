import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('instructors', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.text('bio');
    table.specificType('specializations', 'text[]').defaultTo('{}');
    table.specificType('certifications', 'text[]').defaultTo('{}');
    table.integer('years_experience');
    table.decimal('hourly_rate', 10, 2);
    table.text('profile_image_url');
    table.boolean('is_available').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('user_id');
    table.index('is_available');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('instructors');
}