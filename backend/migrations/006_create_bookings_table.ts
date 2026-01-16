import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('bookings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('class_instance_id').references('id').inTable('class_instances').onDelete('CASCADE');
    table.enu('booking_status', ['confirmed', 'pending', 'cancelled', 'no_show', 'completed']).defaultTo('confirmed');
    table.timestamp('booking_time').defaultTo(knex.fn.now());
    table.string('payment_status', 50).defaultTo('pending');
    table.string('payment_method', 50);
    table.string('payment_transaction_id', 255);
    table.decimal('amount_paid', 10, 2);
    table.integer('credits_used').defaultTo(0);
    table.text('special_requests');
    table.text('cancellation_reason');
    table.timestamp('cancelled_at');
    table.boolean('waitlist_position').defaultTo(false);
    table.integer('waitlist_order');
    table.timestamp('checked_in_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['user_id', 'booking_status']);
    table.index('class_instance_id');
    table.index('booking_time');
    table.index('payment_status');
    table.unique(['user_id', 'class_instance_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('bookings');
}