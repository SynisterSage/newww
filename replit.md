# Overview

This is a premium golf club management system built for Packanack Golf Club as a full-stack web application. The system provides comprehensive functionality for golf club members including member authentication, tee time booking, dining ordering, course GPS tracking, and user dashboard features. It serves as a digital platform to enhance the golf club experience with real member verification, tee time availability, restaurant menu ordering, GPS-enabled course hole information, and member account management using authentic membership data from the club's 2025 roster.

## Recent Progress (August 2025)
✓ **Step 1 Complete**: PostgreSQL database foundation with session-based authentication
- Members stay logged in after refresh using secure session tokens
- Database stores all member data from 2025 CSV roster (5 test members seeded)
- Authentication works with email + phone verification
- Session management with 7-day expiry for members, 1-day for admin

✓ **Debugging and Fixes Complete** (August 1, 2025):
- Fixed database connection issues and TypeScript errors in storage implementation
- Switched from memory storage to PostgreSQL database for persistent data
- Fixed React navigation warnings (nested anchor tags in navigation components)
- Resolved all LSP diagnostics and compilation errors
- App is fully functional with database authentication and data persistence

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom golf club theme colors (green, gold, gray palette)
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured route handlers
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas for runtime type validation
- **Storage**: In-memory storage implementation with interface for future database integration

## Data Storage Solutions
- **Database**: PostgreSQL configured via Drizzle Kit
- **Connection**: Neon Database serverless connection (@neondatabase/serverless)
- **Schema Management**: Centralized schema definitions in shared/schema.ts
- **Migrations**: Drizzle Kit handles schema migrations to ./migrations directory

## Development Environment
- **Build System**: Vite for frontend bundling, esbuild for server bundling
- **Development Server**: Hot module replacement with Vite middleware integration
- **Type Checking**: Strict TypeScript configuration with path mapping
- **Code Organization**: Monorepo structure with shared types between client and server

## Key Features Architecture
- **Member Authentication**: Email and phone verification against real Packanack Golf Club 2025 membership roster (259 members)
- **Admin Management**: Separate admin authentication system for staff with member database access
- **Tee Time Management**: CRUD operations with availability tracking and booking system
- **Dining System**: Menu management with category filtering and order processing
- **GPS Course Tracking**: Hole-by-hole course information with scoring capabilities  
- **User Dashboard**: Member profile management with statistics and account information
- **Responsive Design**: Mobile-first approach with desktop sidebar navigation

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations and schema management

## UI and Styling
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library for consistent iconography
- **Class Variance Authority**: Component variant management
- **Embla Carousel**: Carousel component functionality

## Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across the entire application
- **PostCSS**: CSS processing with Tailwind and Autoprefixer
- **React Hook Form**: Form state management and validation

## Deployment and Runtime
- **Express.js**: Server framework with middleware support
- **Connect PG Simple**: PostgreSQL session store integration
- **Date-fns**: Date manipulation and formatting utilities
- **Nanoid**: Unique ID generation for entities