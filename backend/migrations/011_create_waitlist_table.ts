import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('waitlist', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('class_instance_id').references('id').inTable('class_instances').onDelete('CASCADE');
    table.integer('position').notNullable();
    table.enu('status', ['waiting', 'notified', 'booked', 'cancelled', 'expired']).defaultTo('waiting');
    table.timestamp('joined_at').defaultTo(knex.fn.now());
    table.timestamp('notified_at');
    table.timestamp('response_deadline');
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['class_instance_id', 'status', 'position']);
    table.index(['user_id', 'status']);
    table.index('status');
    table.index('response_deadline');
    table.unique(['user_id', 'class_instance_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('waitlist');
}