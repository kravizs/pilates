import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user_memberships', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('membership_plan_id').references('id').inTable('membership_plans').onDelete('RESTRICT');
    table.date('start_date').notNullable();
    table.date('end_date');
    table.enu('status', ['active', 'inactive', 'frozen', 'cancelled', 'expired']).defaultTo('active');
    table.integer('remaining_credits').defaultTo(0);
    table.integer('remaining_guest_passes').defaultTo(0);
    table.decimal('amount_paid', 10, 2);
    table.string('payment_method', 50);
    table.string('payment_transaction_id', 255);
    table.boolean('auto_renewal').defaultTo(false);
    table.date('frozen_start_date');
    table.date('frozen_end_date');
    table.integer('freeze_days_used').defaultTo(0);
    table.text('freeze_reason');
    table.date('cancellation_date');
    table.text('cancellation_reason');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['user_id', 'status']);
    table.index('membership_plan_id');
    table.index('status');
    table.index(['start_date', 'end_date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('user_memberships');
}