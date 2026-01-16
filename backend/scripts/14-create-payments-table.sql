-- Create payments table for Stripe payment tracking
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_intent_id VARCHAR(255) UNIQUE NOT NULL, -- Stripe payment intent ID
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('membership', 'booking', 'package')),
    membership_plan_id UUID REFERENCES membership_plans(id) ON DELETE SET NULL,
    class_instance_id UUID REFERENCES class_instances(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_intent_id ON payments(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_membership_plan_id ON payments(membership_plan_id) WHERE membership_plan_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_class_instance_id ON payments(class_instance_id) WHERE class_instance_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Add updated_at trigger
CREATE TRIGGER trigger_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE payments IS 'Stripe payment transactions for memberships and bookings';
COMMENT ON COLUMN payments.payment_intent_id IS 'Stripe payment intent ID for tracking';
COMMENT ON COLUMN payments.payment_type IS 'Type of payment: membership, booking, or package';
COMMENT ON COLUMN payments.status IS 'Payment status from Stripe webhooks';
COMMENT ON COLUMN payments.metadata IS 'Additional payment metadata from Stripe';