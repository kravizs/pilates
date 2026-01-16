import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('membership_plans', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 100).notNullable().unique();
    table.text('description');
    table.decimal('price', 10, 2).notNullable();
    table.enu('duration_type', ['monthly', 'quarterly', 'yearly', 'unlimited']).notNullable();
    table.integer('duration_value'); // e.g., 1 for 1 month, 3 for 3 months
    table.integer('class_credits').defaultTo(0); // -1 for unlimited
    table.integer('guest_passes').defaultTo(0);
    table.boolean('freeze_option').defaultTo(false);
    table.integer('max_freeze_days').defaultTo(0);
    table.decimal('enrollment_fee', 10, 2).defaultTo(0);
    table.decimal('cancellation_fee', 10, 2).defaultTo(0);
    table.text('terms_and_conditions');
    table.json('benefits'); // JSON array of benefits
    table.json('restrictions'); // JSON array of restrictions
    table.boolean('is_active').defaultTo(true);
    table.integer('sort_order').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('is_active');
    table.index('duration_type');
    table.index('sort_order');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('membership_plans');
}