# JastipDigital Base44 - Full Stack Application

A comprehensive Jastip (personal shopping service) application built with React + Vite frontend and Supabase backend, featuring real-time capabilities, AI integration, and role-based access control.

## 🏗️ Architecture Overview

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React hooks + Context API
- **Routing**: React Router v7
- **Real-time**: Supabase Realtime subscriptions

### Backend
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth with Google OAuth
- **File Storage**: Supabase Storage with multiple buckets
- **Edge Functions**: Deno runtime for serverless functions
- **Real-time**: WebSocket connections for live updates

### AI & Integrations
- **LLM Support**: OpenAI, Anthropic, Google Gemini
- **Image Generation**: DALL-E 3, Stability AI
- **Email**: Resend, SendGrid support
- **File Processing**: OCR, text extraction, image analysis

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase CLI (optional for local development)
- Docker (optional for containerized deployment)

### 1. Environment Setup

Copy the provided `.env` file and update any additional API keys:

```bash
# Already configured with your Supabase credentials
VITE_SUPABASE_URL=https://kakdtccecijurchyjztq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Add these for full AI functionality (optional)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_google_ai_key
STABILITY_API_KEY=your_stability_ai_key

# Email providers (optional)
RESEND_API_KEY=your_resend_key
SENDGRID_API_KEY=your_sendgrid_key

# Google OAuth (for enhanced auth)
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your_google_client_id
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your_google_secret
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run preview
```

The application will be available at `http://localhost:5173`

## 🗄️ Database Setup

### Automatic Setup (Recommended)

The database schema is already designed for your Supabase project. To apply it:

1. **Via Supabase Dashboard**:
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/kakdtccecijurchyjztq)
   - Navigate to "SQL Editor"
   - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Execute the migration

2. **Via Supabase CLI** (if you have it installed):
   ```bash
   supabase db push
   ```

### Manual Setup

If you prefer manual setup, execute these SQL files in order:
1. `supabase/migrations/001_initial_schema.sql` - Core database schema
2. `supabase/migrations/002_storage_setup.sql` - Storage buckets and policies

## 🔧 Features Configuration

### 1. Authentication Setup

Google OAuth is pre-configured. To set it up:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth credentials
3. Add authorized redirect URIs:
   - `https://kakdtccecijurchyjztq.supabase.co/auth/v1/callback`
   - `http://localhost:5173` (for development)
4. Update environment variables with your Google OAuth credentials

### 2. Edge Functions Deployment

Deploy the AI and utility functions to Supabase:

```bash
# Using Supabase CLI
supabase functions deploy invoke-llm
supabase functions deploy send-email
supabase functions deploy generate-image
supabase functions deploy extract-file-data
```

Or deploy via the Supabase Dashboard by copying the function code from `supabase/functions/` directory.

### 3. Storage Buckets

Storage buckets will be created automatically when you run the storage setup migration. The following buckets are configured:

- `public` - Public images and assets
- `profile-images` - User profile pictures
- `images` - General image uploads
- `documents` - Private document storage
- `order-attachments` - Order-related files
- `driver-documents` - Driver verification documents
- `chat-media` - Chat images and media

## 🐳 Docker Deployment

### Development

```bash
# Run in development mode
docker-compose --profile dev up
```

### Production

```bash
# Build and run production container
docker-compose up jastip-app

# Or with Nginx proxy
docker-compose --profile production up
```

### Environment Variables in Docker

Create a `.env.production` file for production deployment:

```env
NODE_ENV=production
VITE_SUPABASE_URL=https://kakdtccecijurchyjztq.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
# ... other production variables
```

## 📱 Application Features

### Core Functionality
- **User Management**: Registration, authentication, profile management
- **Order System**: Create, track, and manage jastip orders
- **Driver Portal**: Driver registration, verification, and order management
- **Mitra System**: Business partner integration and management
- **Real-time Chat**: Order-specific messaging between users and drivers
- **Payment Integration**: Wallet system and transaction management
- **Location Services**: GPS tracking and zone management

### Advanced Features
- **AI Integration**: LLM-powered assistance and image generation
- **File Processing**: OCR, text extraction, and document analysis
- **Email Notifications**: Automated email system with templates
- **Real-time Updates**: Live order tracking and notifications
- **Admin Panel**: Comprehensive administration interface
- **Analytics**: Usage tracking and performance metrics

## 🔐 Security Features

- **Row Level Security**: Database-level access control
- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Customer, Driver, Mitra, Admin roles
- **File Access Control**: Secure file storage with proper permissions
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Server and client-side validation

## 🚀 Deployment Options

### 1. Vercel (Recommended for Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 2. Netlify

```bash
# Build for production
npm run build

# Deploy to Netlify (drag & drop dist folder)
```

### 3. Docker Container

```bash
# Build image
docker build -t jastip-app .

# Run container
docker run -p 3000:80 jastip-app
```

### 4. VPS/Server

```bash
# Build application
npm run build

# Serve with nginx or any static file server
# Copy dist/ folder to your server
```

## 🔍 Monitoring & Analytics

### Built-in Analytics

The application includes several analytics tables:
- `ai_usage_log` - AI feature usage tracking
- `email_log` - Email delivery tracking  
- `file_extraction_log` - File processing analytics

### Health Checks

- Application health endpoint: `/health`
- Database connectivity monitoring
- Real-time connection status

## 🛠️ Development

### Project Structure

```
├── src/
│   ├── api/                 # API integration layer
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── ui/             # Reusable UI components
│   │   └── ...             # Feature-specific components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── pages/              # Page components
│   └── utils/              # Helper utilities
├── supabase/
│   ├── functions/          # Edge Functions
│   ├── migrations/         # Database migrations
│   └── config.toml         # Supabase configuration
├── public/                 # Static assets
└── docs/                   # Documentation
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Database Migrations

```bash
# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Reset database (development only)
supabase db reset
```

## 📚 API Documentation

### Authentication Endpoints

All authentication is handled by Supabase Auth. Key endpoints:

- `POST /auth/v1/signup` - User registration
- `POST /auth/v1/token` - Login
- `POST /auth/v1/logout` - Logout
- `GET /auth/v1/user` - Get current user

### Database Tables

Key tables and their purposes:

| Table | Purpose |
|-------|---------|
| `User` | User profiles and metadata |
| `driver` | Driver information and verification |
| `Order` | Jastip orders and tracking |
| `chat` | Real-time messaging |
| `review` | Order reviews and ratings |
| `provider_wallet` | Payment and wallet system |

### Edge Functions

| Function | Purpose |
|----------|---------|
| `invoke-llm` | AI language model integration |
| `send-email` | Email notifications |
| `generate-image` | AI image generation |
| `extract-file-data` | File processing and OCR |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m "Add feature"`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

1. Check the [documentation](./docs/)
2. Create an issue on GitHub
3. Contact the development team

## 🚀 Production Checklist

Before deploying to production:

- [ ] Set up environment variables
- [ ] Configure Google OAuth
- [ ] Set up email provider (Resend/SendGrid)
- [ ] Configure AI API keys (optional)
- [ ] Run database migrations
- [ ] Set up storage buckets
- [ ] Deploy Edge Functions
- [ ] Configure domain and SSL
- [ ] Set up monitoring and analytics
- [ ] Test all features thoroughly

---

**JastipDigital Base44** - Building the future of personal shopping services in Indonesia 🇮🇩