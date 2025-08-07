# Overview

This is a conversation analysis application that uses AI to analyze interpersonal communications and provide psychological insights. The application allows users to input conversations and receive detailed analysis including emotional tone, power dynamics, communication patterns, and relationship insights. It features a React frontend with shadcn/ui components and an Express.js backend with OpenAI integration for AI-powered analysis.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter for lightweight client-side routing

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with routes for conversations and analysis
- **Data Storage**: In-memory storage with interface for future database integration
- **AI Integration**: OpenAI GPT-4o for conversation analysis
- **Error Handling**: Centralized error middleware with structured error responses

## Data Storage Solutions
- **Current**: In-memory storage using Maps for development/testing
- **Future**: Configured for PostgreSQL with Drizzle ORM
- **Schema**: Defined database schema for users, conversations, and analyses
- **Migration**: Drizzle-kit configured for database migrations

## Authentication and Authorization
- **Current**: No authentication implemented
- **Infrastructure**: User schema defined for future authentication implementation
- **Session Management**: Connect-pg-simple configured for PostgreSQL session storage

## External Dependencies
- **AI Service**: OpenAI API for conversation analysis using GPT-4o model
- **Database**: Neon Database (PostgreSQL) configured but not actively used
- **UI Components**: Radix UI primitives for accessible components
- **Validation**: Zod for runtime type checking and form validation
- **Development**: Replit-specific plugins for development environment integration

The application follows a clean separation of concerns with shared TypeScript schemas between frontend and backend, ensuring type safety across the full stack. The modular architecture allows for easy extension and modification of features.