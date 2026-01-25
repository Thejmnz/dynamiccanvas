# Dynamic Canvas

A powerful Next.js application for dynamic image rendering and template management using Supabase.

## Features

- 🎨 Dynamic image template rendering
- 🔐 User authentication with Supabase
- 📦 Media storage and management
- 🚀 Built with Next.js 14 and TypeScript
- 💾 PostgreSQL database with Drizzle ORM
- 🎨 Styled with Tailwind CSS

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or bun package manager
- A Supabase account and project

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Thejmnz/dynamiccanva.git
cd dynamiccanva
```

### 2. Install dependencies

```bash
npm install
# or
bun install
```

### 3. Set up environment variables

Copy the `.env.example` file to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit the `.env` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_UPLOADS_BUCKET=media
DATABASE_URL=postgresql://user:password@host:5432/database
AUTH_SECRET=your_auth_secret_here
```

To generate a secure `AUTH_SECRET`, run:
```bash
openssl rand -base64 32
```

### 4. Run database migrations

```bash
npm run db:push
# or
bun run db:push
```

### 5. Start the development server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
dynamiccanva/
├── src/
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── lib/          # Utility functions and configurations
│   └── styles/       # Global styles
├── public/           # Static assets
├── drizzle/          # Database migrations
└── ...config files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Supabase)
- **ORM:** Drizzle
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage

## Deployment

This application can be deployed to various platforms:

### Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/dynamiccanva)

### Docker Deployment
  
1. **Build the image:**
   ```bash
   docker build -t dynamiccanva .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 --env-file .env dynamiccanva
   ```
   *Note: Ensure you have your `.env` file created locally.*

### Other Platforms
- Vercel (Recommended)
- Railway
- Render
- Your own VPS/server

Make sure to set all environment variables in your deployment platform.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions, please open an issue on GitHub.