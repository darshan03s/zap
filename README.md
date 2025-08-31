# ZapAI - Create websites by prompting AI

[![Watch the demo](https://res.cloudinary.com/dqzusd5rw/image/upload/v1756639307/Screenshot_2025-08-31_163753_whqmyy.png)](https://res.cloudinary.com/dqzusd5rw/video/upload/v1756639314/demo_r51yg3.mp4)


## Technology Stack

### Frontend
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **TailwindCSS v4** - Utility-first CSS framework
- **React Router** - Client-side routing
- **CodeMirror** - Code editor with syntax highlighting
- **XTerm.js** - Terminal emulator in the browser
- **WebContainer API** - Run Node.js in the browser
- **Radix UI** - Accessible UI components
- **Lucide Icons** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Google Gemini AI** - AI-powered code generation
- **Supabase** - Database and authentication

### Development Tools
- **pnpm** - Fast package manager
- **ESLint** - Code linting
- **TypeScript** - Type checking

## Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- Git

## Installation & Setup

### Clone the Repository
```bash
git clone https://github.com/darshan03s/ai-website-maker.git
cd ai-website-maker
```

### Backend Setup
```bash
cd backend

# Install dependencies
pnpm install

# Create .env file with required environment variables
cp .env.example .env

# Add your environment variables:

# Start development server
pnpm run dev
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
pnpm install

cp .env.example .env

# Add your environment variables:

# Start development server
pnpm run dev
```