# FitFlow - Progressive Workout Training App

## Overview

FitFlow is a progressive workout training application that provides structured fitness programs with weekly progression. The application uses a full-stack architecture with React frontend and Express.js backend, utilizing PostgreSQL for data persistence. The system is designed to track workout programs, training sessions, and exercise completions while supporting offline functionality for mobile users.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### August 13, 2025 - Authentic Russian Workout Data & UI Fixes
- **Replaced workout data with authentic Russian exercises**: Complete replacement using user's CSV files with real exercise names, instructions, and weekly progressions
- **Added 16 detailed warm-up exercises**: Organized by categories (МФР, Мобильность, Активация) with specific timing and instructions
- **Updated cool-down routine**: Single flexible exercise with recovery focus and user-defined timing
- **Fixed bottom controls overlap**: Restructured layout using proper flexbox to eliminate content overlap issues
- **Set video file paths for deployment**: All exercises now have proper `/video/[exercise-name].mp4` paths matching user's file structure

**Implementation Details:**
- Workout data now includes 3 training days (День A, B, C) with authentic Russian exercises
- МФР exercises: 7 foam rolling exercises (45sec intensive per side)
- Мобильность exercises: 4 mobility exercises (2 sets 20sec intensive per side)  
- Активация exercises: 5 activation exercises (2 sets 20sec intensive per side)
- Cool-down: Flexible timing and movement (время и количество движений произвольное)
- Fixed UI layout using flex containers to prevent bottom controls from overlapping exercise content
- Ready for frontend-only deployment to Cloudflare Pages

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Modern component-based UI built with React 18 and TypeScript for type safety
- **Wouter**: Lightweight client-side routing replacing React Router
- **TanStack Query**: Server state management and data fetching with caching
- **Tailwind CSS + Shadcn/ui**: Utility-first CSS framework with pre-built component library
- **Progressive Web App (PWA)**: Service worker implementation for offline support and app-like experience

### Backend Architecture
- **Express.js**: RESTful API server with TypeScript support
- **Storage Abstraction Layer**: Interface-based storage design allowing for easy database swapping
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Development Integration**: Vite middleware for seamless development experience

### Database Design
- **PostgreSQL + Drizzle ORM**: Type-safe database operations with schema-first approach
- **Core Entities**:
  - Users with authentication
  - Workout Programs with weekly progression
  - Training Days (A, B, C rotation)
  - Exercises with week-specific formulas
  - Workout Sessions with completion tracking
  - Exercise Completions with performance data
  - User Settings for personalization

### Progressive Training Logic
- **7-Week Program Structure**: Predefined progression from RPE 6-7 to RPE 9
- **Dynamic Exercise Formulas**: Week-specific sets, reps, and intensity stored as JSON
- **Auto-Progression**: Automatic advancement based on completion and time
- **Training Day Rotation**: A/B/C day structure with different exercise focuses

### Mobile-First Design
- **Touch Interactions**: Swipeable exercise cards and gesture-based navigation
- **Offline Data Sync**: LocalStorage caching with background sync
- **Timer Integration**: Built-in workout timer with pause/resume functionality
- **PWA Features**: Installable app with push notifications support

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL provider (@neondatabase/serverless)
- **Drizzle**: Type-safe ORM with PostgreSQL dialect
- **Connect-pg-simple**: PostgreSQL session store for Express

### UI & Styling
- **Radix UI**: Headless component primitives for complex UI patterns
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **Embla Carousel**: Touch-friendly carousel component

### Development Tools
- **Vite**: Fast build tool with HMR and TypeScript support
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development server
- **PostCSS**: CSS processing with Autoprefixer

### Form & Validation
- **React Hook Form**: Performant form library with validation
- **Zod**: Runtime type validation integrated with Drizzle schemas
- **@hookform/resolvers**: Validation resolver for React Hook Form + Zod

### Utilities
- **Date-fns**: Modern date utility library
- **Class-variance-authority**: Utility for managing component variants
- **CLSX**: Conditional className utility
- **Nanoid**: URL-safe unique ID generator