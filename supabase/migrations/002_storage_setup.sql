-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('public', 'public', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('images', 'images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']),
  ('documents', 'documents', false, 104857600, ARRAY['application/pdf', 'text/plain', 'text/csv', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('profile-images', 'profile-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('order-attachments', 'order-attachments', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain']),
  ('driver-documents', 'driver-documents', false, 20971520, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('chat-media', 'chat-media', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/wav'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for public bucket
CREATE POLICY "Public bucket is publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'public');

CREATE POLICY "Users can upload to public bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'public' AND auth.uid() IS NOT NULL);

-- Storage policies for images bucket
CREATE POLICY "Images are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for profile images
CREATE POLICY "Profile images are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.uid() IS NOT NULL 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own profile images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for documents bucket
CREATE POLICY "Users can view their own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' 
    AND auth.uid() IS NOT NULL 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for order attachments
CREATE POLICY "Order attachment access" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'order-attachments' 
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR auth.uid() IN (
        SELECT driver.user_id FROM driver 
        JOIN "Order" ON "Order".driver_id = driver.id 
        WHERE "Order".id::text = (storage.foldername(name))[2]
      )
      OR auth.uid() IN (
        SELECT user_id FROM "Order" 
        WHERE id::text = (storage.foldername(name))[2]
      )
    )
  );

CREATE POLICY "Users can upload order attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'order-attachments' 
    AND auth.uid() IS NOT NULL
  );

-- Storage policies for driver documents
CREATE POLICY "Driver documents access" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'driver-documents' 
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM "User" 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "Drivers can upload their documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'driver-documents' 
    AND auth.uid() IS NOT NULL 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Drivers can update their documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'driver-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for chat media
CREATE POLICY "Chat media access" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-media' 
    AND auth.uid() IN (
      SELECT sender_id FROM chat 
      WHERE order_id::text = (storage.foldername(name))[1]
      UNION
      SELECT user_id FROM "Order" 
      WHERE id::text = (storage.foldername(name))[1]
      UNION 
      SELECT driver.user_id FROM driver 
      JOIN "Order" ON "Order".driver_id = driver.id 
      WHERE "Order".id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Users can upload chat media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-media' 
    AND auth.uid() IS NOT NULL
  );

-- Additional tables for storage management
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES "User"(id),
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    provider TEXT DEFAULT 'resend',
    status TEXT DEFAULT 'sent',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS ai_usage_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES "User"(id),
    model TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    request_type TEXT NOT NULL,
    prompt TEXT,
    result_count INTEGER DEFAULT 1,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS file_extraction_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES "User"(id),
    file_url TEXT NOT NULL,
    extraction_type TEXT NOT NULL,
    content_type TEXT,
    result_size INTEGER,
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default email templates
INSERT INTO email_templates (name, subject, content, variables) VALUES
(
  'order_confirmation',
  'Order Confirmation - {{order_title}}',
  '<h1>Order Confirmed!</h1><p>Hello {{customer_name}},</p><p>Your order "{{order_title}}" has been confirmed and is being processed.</p><p><strong>Order Details:</strong></p><ul><li>Order ID: {{order_id}}</li><li>Pickup: {{pickup_location}}</li><li>Delivery: {{delivery_location}}</li><li>Estimated Price: {{estimated_price}}</li></ul><p>You will receive updates as your order progresses.</p><p>Thank you for using JastipDigital!</p>',
  '["customer_name", "order_title", "order_id", "pickup_location", "delivery_location", "estimated_price"]'
),
(
  'driver_assignment',
  'New Order Assignment - {{order_title}}',
  '<h1>New Order Assignment</h1><p>Hello {{driver_name}},</p><p>You have been assigned a new order:</p><p><strong>Order Details:</strong></p><ul><li>Order: {{order_title}}</li><li>Customer: {{customer_name}}</li><li>Pickup: {{pickup_location}}</li><li>Delivery: {{delivery_location}}</li><li>Price: {{final_price}}</li></ul><p>Please check your dashboard for more details.</p>',
  '["driver_name", "order_title", "customer_name", "pickup_location", "delivery_location", "final_price"]'
),
(
  'order_completed',
  'Order Completed - {{order_title}}',
  '<h1>Order Completed!</h1><p>Hello {{customer_name}},</p><p>Your order "{{order_title}}" has been completed successfully!</p><p>Please rate your experience and provide feedback to help us improve our service.</p><p>Thank you for choosing JastipDigital!</p>',
  '["customer_name", "order_title"]'
),
(
  'welcome_driver',
  'Welcome to JastipDigital - Driver Account',
  '<h1>Welcome to JastipDigital!</h1><p>Hello {{driver_name}},</p><p>Your driver account has been approved! You can now start accepting orders and earning money.</p><p><strong>Next Steps:</strong></p><ol><li>Complete your profile</li><li>Upload required documents</li><li>Set your availability</li><li>Start accepting orders</li></ol><p>Good luck with your first deliveries!</p>',
  '["driver_name"]'
);

-- Create indexes for performance
CREATE INDEX idx_email_log_user ON email_log(user_id);
CREATE INDEX idx_email_log_sent_at ON email_log(sent_at);
CREATE INDEX idx_ai_usage_user ON ai_usage_log(user_id);
CREATE INDEX idx_ai_usage_timestamp ON ai_usage_log(timestamp);
CREATE INDEX idx_file_extraction_user ON file_extraction_log(user_id);
CREATE INDEX idx_file_extraction_timestamp ON file_extraction_log(extracted_at);