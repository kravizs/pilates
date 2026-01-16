-- Add MindBody integration columns to existing tables
-- Users table: add mindbody_client_id
ALTER TABLE users ADD COLUMN IF NOT EXISTS mindbody_client_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_users_mindbody_client_id ON users(mindbody_client_id) WHERE mindbody_client_id IS NOT NULL;

-- Instructors table: add mindbody_id
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS mindbody_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_instructors_mindbody_id ON instructors(mindbody_id) WHERE mindbody_id IS NOT NULL;

-- Class types table: add mindbody_id
ALTER TABLE class_types ADD COLUMN IF NOT EXISTS mindbody_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_class_types_mindbody_id ON class_types(mindbody_id) WHERE mindbody_id IS NOT NULL;

-- Class schedules table: add mindbody_id
ALTER TABLE class_schedules ADD COLUMN IF NOT EXISTS mindbody_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_class_schedules_mindbody_id ON class_schedules(mindbody_id) WHERE mindbody_id IS NOT NULL;

-- Class instances table: add mindbody_id
ALTER TABLE class_instances ADD COLUMN IF NOT EXISTS mindbody_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_class_instances_mindbody_id ON class_instances(mindbody_id) WHERE mindbody_id IS NOT NULL;

-- Bookings table: add mindbody_booking_id and cancellation fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS mindbody_booking_id VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_bookings_mindbody_booking_id ON bookings(mindbody_booking_id) WHERE mindbody_booking_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_canceled_at ON bookings(canceled_at) WHERE canceled_at IS NOT NULL;

-- Add comments
COMMENT ON COLUMN users.mindbody_client_id IS 'MindBody client ID for API integration';
COMMENT ON COLUMN instructors.mindbody_id IS 'MindBody staff ID for instructor sync';
COMMENT ON COLUMN class_types.mindbody_id IS 'MindBody class description ID';
COMMENT ON COLUMN class_schedules.mindbody_id IS 'MindBody class schedule ID';
COMMENT ON COLUMN class_instances.mindbody_id IS 'MindBody class instance ID';
COMMENT ON COLUMN bookings.mindbody_booking_id IS 'MindBody booking ID for sync';
COMMENT ON COLUMN bookings.cancellation_reason IS 'Reason provided when booking was canceled';
COMMENT ON COLUMN bookings.canceled_at IS 'Timestamp when booking was canceled';