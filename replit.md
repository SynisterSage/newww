# Overview

This is a premium golf club management system built for Packanack Golf Club as a full-stack web application. The system provides comprehensive functionality for golf club members including member authentication, tee time booking, dining ordering, course GPS tracking, and user dashboard features. It serves as a digital platform to enhance the golf club experience with real member verification, tee time availability, restaurant menu ordering, GPS-enabled course hole information, and member account management using authentic membership data from the club's 2025 roster.

## Recent Progress (August 2025)
✓ **Step 1 Complete**: PostgreSQL database foundation with session-based authentication
- Members stay logged in after refresh using secure session tokens
- Database stores all member data from 2025 CSV roster (5 test members seeded)
- Authentication works with email + phone verification
- Session management with 7-day expiry for members, 1-day for admin

✓ **Complete Events System Real-Time Updates Fix** (August 5, 2025):
- Fixed registration count (0/50) now updating live on admin side with 5-second refresh intervals
- Implemented automatic cleanup of ended events - events from yesterday and earlier automatically marked inactive
- Fixed events requiring manual refresh - both admin and member sides now update automatically every 5 seconds
- Added events to admin dashboard recent activity feed showing event creation alongside food orders and tee times
- Events now refresh in real-time when admin creates/updates/deletes events with proper query invalidation
- Fixed 500 error in events API and restored automatic cleanup with proper date-based filtering
- Both member and admin event pages use consistent real-time updates for registration counts and event data

✓ **Complete Authentication System Fix** (August 5, 2025):
- Fixed critical corrupted server/storage.ts file that had thousands of syntax errors preventing all logins
- Restored clean DatabaseStorage implementation with proper authentication methods
- Updated database schema with missing columns (payment_status, membership_class, etc.)
- Event deletion now properly removes events from database instead of marking inactive
- All authentication routes working for both members and admins with 30-minute session duration
- Admin credentials working: admin@golf.com/admin123 and afergyy@gmail.com/Booly1969!
- Member authentication working with email/phone verification against 259-member database
- Authentication system fully operational with proper session management and real-time updates

✓ **Debugging and Fixes Complete** (August 1, 2025):
- Fixed database connection issues and TypeScript errors in storage implementation
- Switched from memory storage to PostgreSQL database for persistent data
- Fixed React navigation warnings (nested anchor tags in navigation components)
- Resolved all LSP diagnostics and compilation errors
- App is fully functional with database authentication and data persistence

✓ **Dashboard Redesign Complete** (August 1, 2025):
- Fixed dashboard real-time updates by adding missing GET /api/orders route
- Removed "Rounds This Month" and "Best Score" stats as requested
- Redesigned with professional layout: Your Activity section with large tee times and orders cards
- Added Today's Weather section with gradient design and detailed conditions
- Added Club Status section showing course, dining, and tee time availability
- Dashboard now shows actual user data and updates immediately when members book or order
- Improved cache invalidation ensures real-time sync across all dashboard sections

✓ **Course Conditions Management Complete** (August 1, 2025):
- Added course conditions schema to PostgreSQL database with weather, temperature, course status fields
- Created comprehensive admin interface for updating weather conditions, cart path restrictions, and course status
- Implemented API routes for fetching and updating course conditions
- Added course conditions to admin navigation with proper UI components and form validation
- System allows admins to manage all course information that members can view
- Redesigned member conditions page with clean grid layout and proper 9-hole course information
- Real-time sync between admin updates and member view with weather icons and status badges

✓ **Tee Times Grid Schedule Complete** (August 1, 2025):
- Redesigned tee times page to display grid-style schedule from 7 AM to 7 PM with 16-minute intervals
- Updated database schema to support multiple players per tee time (bookedBy and playerNames arrays)
- Created JOIN/LEAVE functionality for tee time bookings with 4-player maximum per slot
- Fixed API endpoints to return proper JSON data for date-specific tee time requests
- Pre-populated database with 45 tee time slots per day from 7 AM to 7 PM
- Implemented consistent visual styling - boxes remain in same position when players join/leave
- Status updates show "Available" → "1/4 Players" → "2/4 Players" etc. without moving boxes
- Real-time booking system with immediate updates and proper cache invalidation

✓ **Automatic Tee Time Generation System Complete** (August 3, 2025):
- **CRITICAL ARCHITECTURAL CHANGE**: Implemented automatic tee time generation for sustainable operations
- System automatically generates 30 tee times per day when users request dates that don't exist in database
- Enforces club's 2-day advance booking policy (today + tomorrow only)
- Eliminates need for manual database seeding of future tee times - fully self-sustaining
- Uses generateTeetimesForDate() method in DatabaseStorage to create slots on-demand
- Time slots: 6:00 AM to 1:15 PM in 15-minute intervals (30 slots total)
- System will continue working indefinitely without manual intervention

✓ **Complete Membership Database Import Complete** (August 3, 2025):
- **MAJOR DATABASE ENHANCEMENT**: Imported all 256 members from 2025 membership roster
- Added new columns to users table: payment_status, membership_class, status, year_joined, birthday, spouse, lockers, spouse_locker, bag_storage, food, extra_handicap, restricted_assessment, special_considerations, lottery_eligible
- Total member count increased from 50 to 306 users (256 new + 50 existing)
- All authentic member data from Packanack Golf Club 2025 roster now in system
- Includes payment status (Paid/Payment Plan), membership classes (A, AG, G, H, HM, etc.), joining years, family information, and special assessments
- System now operates with complete authentic membership database for realistic testing and operations

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
- **Member Authentication**: Email and phone verification against real Packanack Golf Club 2025 membership roster (306 total members)
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