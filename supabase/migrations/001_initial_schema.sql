-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'driver', 'mitra', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE vehicle_type AS ENUM ('motorcycle', 'car', 'van', 'truck');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Users table (extends Supabase auth.users)
CREATE TABLE "User" (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    profile_image_url TEXT,
    role user_role DEFAULT 'customer',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drivers table
CREATE TABLE driver (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES "User"(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT,
    vehicle_type vehicle_type NOT NULL,
    vehicle_number TEXT,
    license_number TEXT,
    current_location POINT,
    is_active BOOLEAN DEFAULT FALSE,
    verification_status verification_status DEFAULT 'pending',
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mitra (business partners) table
CREATE TABLE mitra (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES "User"(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_type TEXT,
    address TEXT,
    phone_number TEXT,
    email TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    is_active BOOLEAN DEFAULT TRUE,
    verification_status verification_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE "Order" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES "User"(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES driver(id) ON DELETE SET NULL,
    mitra_id UUID REFERENCES mitra(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    pickup_location TEXT NOT NULL,
    pickup_coordinates POINT,
    delivery_location TEXT NOT NULL,
    delivery_coordinates POINT,
    estimated_price DECIMAL(12,2),
    final_price DECIMAL(12,2),
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pickup_time TIMESTAMP WITH TIME ZONE,
    delivery_time TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    items JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}'
);

-- Reviews table
CREATE TABLE review (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES "Order"(id) ON DELETE CASCADE,
    user_id UUID REFERENCES "User"(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES driver(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES "Order"(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES "User"(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    file_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallet/Payment table
CREATE TABLE provider_wallet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID, -- Can reference driver or mitra
    provider_type TEXT NOT NULL, -- 'driver' or 'mitra'
    balance DECIMAL(12,2) DEFAULT 0.00,
    total_earned DECIMAL(12,2) DEFAULT 0.00,
    total_withdrawn DECIMAL(12,2) DEFAULT 0.00,
    bank_account TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction history
CREATE TABLE transaction (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES provider_wallet(id) ON DELETE CASCADE,
    order_id UUID REFERENCES "Order"(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- 'credit', 'debit', 'withdrawal'
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Zones/Coverage areas
CREATE TABLE zone (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    polygon GEOMETRY(POLYGON),
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES "User"(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Zone assignments for drivers
CREATE TABLE driver_zone (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES driver(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES zone(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(driver_id, zone_id)
);

-- Notifications table
CREATE TABLE notification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES "User"(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File uploads table
CREATE TABLE file_upload (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES "User"(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    bucket_name TEXT DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App settings/configuration
CREATE TABLE app_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_phone ON "User"(phone_number);
CREATE INDEX idx_driver_location ON driver USING GIST(current_location);
CREATE INDEX idx_driver_active ON driver(is_active);
CREATE INDEX idx_order_user ON "Order"(user_id);
CREATE INDEX idx_order_driver ON "Order"(driver_id);
CREATE INDEX idx_order_status ON "Order"(status);
CREATE INDEX idx_order_created ON "Order"(created_date);
CREATE INDEX idx_chat_order ON chat(order_id);
CREATE INDEX idx_chat_created ON chat(created_at);
CREATE INDEX idx_review_driver ON review(driver_id);
CREATE INDEX idx_review_order ON review(order_id);
CREATE INDEX idx_notification_user ON notification(user_id);
CREATE INDEX idx_notification_read ON notification(is_read);

-- Create RLS (Row Level Security) policies
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver ENABLE ROW LEVEL SECURITY;
ALTER TABLE mitra ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE review ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification ENABLE ROW LEVEL SECURITY;

-- RLS Policies for User table
CREATE POLICY "Users can view own profile" ON "User"
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON "User"
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for Orders
CREATE POLICY "Users can view own orders" ON "Order"
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
        SELECT user_id FROM driver WHERE id = "Order".driver_id
    ));

CREATE POLICY "Users can create orders" ON "Order"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON "Order"
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IN (
        SELECT user_id FROM driver WHERE id = "Order".driver_id
    ));

-- RLS Policies for Chat
CREATE POLICY "Users can view chat for their orders" ON chat
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM "Order" WHERE user_id = auth.uid() OR driver_id IN (
                SELECT id FROM driver WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can send messages" ON chat
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_updated_at BEFORE UPDATE ON driver
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mitra_updated_at BEFORE UPDATE ON mitra
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallet_updated_at BEFORE UPDATE ON provider_wallet
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default app configuration
INSERT INTO app_config (key, value, description) VALUES
('app_name', '"JastipDigital Base44"', 'Application name'),
('commission_rate', '15.0', 'Default commission rate percentage'),
('currency', '"IDR"', 'Default currency'),
('min_order_amount', '10000', 'Minimum order amount'),
('max_order_amount', '10000000', 'Maximum order amount'),
('gps_tracking_enabled', 'true', 'Enable GPS tracking for orders'),
('weather_pricing_enabled', 'true', 'Enable weather-based pricing adjustments'),
('audit_trail_enabled', 'true', 'Enable audit trail for compliance');