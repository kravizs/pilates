import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('reviews', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('class_instance_id').references('id').inTable('class_instances').onDelete('CASCADE');
    table.uuid('instructor_id').references('id').inTable('instructors').onDelete('SET NULL');
    table.integer('rating').notNullable().checkBetween([1, 5]);
    table.text('comment');
    table.json('detailed_ratings'); // JSON object for specific aspects like cleanliness, music, etc.
    table.boolean('is_public').defaultTo(true);
    table.boolean('is_verified').defaultTo(false); // Only reviews from actual attendees
    table.integer('helpful_count').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['class_instance_id', 'is_public']);
    table.index(['instructor_id', 'is_public']);
    table.index(['user_id']);
    table.index('rating');
    table.index('is_verified');
    table.unique(['user_id', 'class_instance_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('reviews');
}