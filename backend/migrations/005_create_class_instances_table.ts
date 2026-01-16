import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('class_instances', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('class_schedule_id').references('id').inTable('class_schedules').onDelete('CASCADE');
    table.uuid('class_type_id').references('id').inTable('class_types').onDelete('CASCADE');
    table.uuid('instructor_id').references('id').inTable('instructors').onDelete('SET NULL');
    table.date('class_date').notNullable();
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.string('room_name', 100);
    table.integer('max_capacity').notNullable();
    table.integer('current_bookings').defaultTo(0);
    table.enu('status', ['scheduled', 'cancelled', 'completed']).defaultTo('scheduled');
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('class_date');
    table.index('instructor_id');
    table.index('status');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('class_instances');
}