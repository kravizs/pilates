import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('cms_content', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('content_type', 50).notNullable(); // 'page', 'blog_post', 'announcement', 'faq', 'policy'
    table.string('title', 255).notNullable();
    table.string('slug', 255).unique();
    table.text('content').notNullable();
    table.text('excerpt');
    table.json('metadata'); // SEO, images, custom fields
    table.json('translations'); // Multi-language content
    table.enu('status', ['draft', 'published', 'archived']).defaultTo('draft');
    table.uuid('author_id').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('published_at');
    table.integer('view_count').defaultTo(0);
    table.integer('sort_order').defaultTo(0);
    table.boolean('is_featured').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['content_type', 'status']);
    table.index('slug');
    table.index('status');
    table.index('published_at');
    table.index('is_featured');
    table.index('sort_order');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('cms_content');
}