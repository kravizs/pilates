import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('class_schedules', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('class_type_id').references('id').inTable('class_types').onDelete('CASCADE');
    table.uuid('instructor_id').references('id').inTable('instructors').onDelete('SET NULL');
    table.integer('day_of_week').checkBetween([0, 6]); // 0 = Sunday, 6 = Saturday
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.string('room_name', 100);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['day_of_week', 'start_time']);
    table.index('instructor_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('class_schedules');
}