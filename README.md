# Recip-me - Modern Recipe Management Platform

Recip-me is a sophisticated recipe management and cooking companion application built with modern web technologies. It combines the power of Next.js, Supabase, and AI to provide a seamless cooking experience.

## 🌟 Key Features

- **Recipe Management**: Easily store, organize, and access your favorite recipes
- **Authentication**: Secure user authentication powered by Supabase
- **Modern UI**: Beautiful and responsive interface built with Tailwind CSS and Radix UI
- **AI Integration**: Leveraging Anthropic's Claude AI for enhanced recipe processing
- **Cloud Storage**: Image handling with Cloudinary integration
- **Type Safety**: Full TypeScript support throughout the application

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 19
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Supabase (Database & Authentication)
- **AI**: Anthropic Claude API
- **Image Storage**: Cloudinary
- **Type Safety**: TypeScript, Zod
- **Development Tools**: ESLint, Prettier

## 🛠️ Development Setup

### Requirements

- Node.js 20+
- pnpm 9+
- Docker (optional, for local development)

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Recip-me
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**

   - Copy `.env.example` to `.env`
   - Fill in the required environment variables:
     - Supabase credentials
     - Anthropic API key
     - Cloudinary configuration
     - Other service-specific keys

4. **Database Setup**
   start your local supabase server with the command

   ```bash
   pnpm supabase start # Start the Supabase server
   ```

   then fill the following environment variables in the `.env` file. you can also run `pnpm supabase status` to get the url and anon key if you already have the server running.

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=(your supabase url)
   NEXT_PUBLIC_SUPABASE_ANON_KEY=(your supabase anon key)
   ```

   then run the following commands to reset the database to the latest schema, pull the latest database schema, and generate TypeScript types

   ```bash
   pnpm db:reset     # Reset the database to the latest schema
   pnpm db:pull     # Pull the latest database schema
   pnpm db:generate-types  # Generate TypeScript types
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

## 🌐 Deployment

1. **Build the application**

   ```bash
   pnpm build
   ```

2. **Deploy to your preferred platform**

   - Vercel (Recommended)
   - Netlify
   - Self-hosted

3. **Environment Variables**
   - Ensure all environment variables from `.env` are properly set in your deployment platform
   - Configure proper CORS settings in Supabase

## 🧪 Quality Assurance

- **Linting**: `pnpm lint`
- **Type Checking**: `pnpm type-check`
- **Format Code**: `pnpm format`

## 📝 Database Management

- Reset database: `pnpm db:reset`
- Push schema changes: `pnpm db:push`
- Pull schema updates: `pnpm db:pull`
- Generate types: `pnpm db:generate-types`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
