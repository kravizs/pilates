import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable UUID extension if not already enabled
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  
  // Create indexes and constraints
  await knex.raw(`
    -- Add performance indexes
    CREATE INDEX IF NOT EXISTS idx_bookings_user_status_date 
    ON bookings(user_id, booking_status, booking_time DESC);
    
    CREATE INDEX IF NOT EXISTS idx_class_instances_date_status 
    ON class_instances(class_date, status, start_time);
    
    CREATE INDEX IF NOT EXISTS idx_user_memberships_active 
    ON user_memberships(user_id, status) WHERE status = 'active';
    
    -- Add triggers for updated_at timestamps
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
    
    -- Apply triggers to all tables with updated_at
    DO $$
    DECLARE
        table_name text;
        tables_with_updated_at text[] := ARRAY[
            'users', 'instructors', 'class_types', 'class_schedules', 
            'class_instances', 'bookings', 'membership_plans', 
            'user_memberships', 'reviews', 'cms_content', 'waitlist'
        ];
    BEGIN
        FOREACH table_name IN ARRAY tables_with_updated_at
        LOOP
            EXECUTE format('
                CREATE TRIGGER trigger_update_%I_updated_at
                BEFORE UPDATE ON %I
                FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column()
            ', table_name, table_name);
        END LOOP;
    END $$;
    
    -- Add check constraints
    ALTER TABLE reviews ADD CONSTRAINT check_rating_range CHECK (rating >= 1 AND rating <= 5);
    ALTER TABLE class_instances ADD CONSTRAINT check_time_order CHECK (start_time < end_time);
    ALTER TABLE user_memberships ADD CONSTRAINT check_date_order CHECK (start_date <= COALESCE(end_date, start_date));
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Remove triggers and functions
  await knex.raw(`
    DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
    DROP TRIGGER IF EXISTS trigger_update_instructors_updated_at ON instructors;
    DROP TRIGGER IF EXISTS trigger_update_class_types_updated_at ON class_types;
    DROP TRIGGER IF EXISTS trigger_update_class_schedules_updated_at ON class_schedules;
    DROP TRIGGER IF EXISTS trigger_update_class_instances_updated_at ON class_instances;
    DROP TRIGGER IF EXISTS trigger_update_bookings_updated_at ON bookings;
    DROP TRIGGER IF EXISTS trigger_update_membership_plans_updated_at ON membership_plans;
    DROP TRIGGER IF EXISTS trigger_update_user_memberships_updated_at ON user_memberships;
    DROP TRIGGER IF EXISTS trigger_update_reviews_updated_at ON reviews;
    DROP TRIGGER IF EXISTS trigger_update_cms_content_updated_at ON cms_content;
    DROP TRIGGER IF EXISTS trigger_update_waitlist_updated_at ON waitlist;
    
    DROP FUNCTION IF EXISTS update_updated_at_column();
  `);
}