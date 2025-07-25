# Smart Recipe Generator

## Overview

This is a full-stack web application that generates personalized recipes using AI. Users can input ingredients they have available, specify dietary preferences and cooking time constraints, and receive tailored recipe suggestions. The app features a modern React frontend with a Node.js/Express backend, using OpenAI's GPT-4o model for recipe generation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database**: PostgreSQL with Drizzle ORM (configured but not actively used)
- **Storage**: In-memory storage for user data (MemStorage class)
- **Development**: Hot module replacement with Vite integration

## Key Components

### Frontend Components
1. **IngredientInput**: Form component for collecting ingredients and preferences
2. **RecipeCard**: Display component for recipe previews with favorite functionality
3. **RecipeModal**: Detailed recipe view with full instructions and ingredients
4. **UI Library**: Complete set of shadcn/ui components (buttons, dialogs, forms, etc.)

### Backend Components
1. **Server Setup**: Express server with middleware for JSON parsing and logging
2. **Storage Interface**: Abstract storage interface with in-memory implementation
3. **Route Registration**: Modular route handling system (currently minimal)
4. **Development Integration**: Vite middleware for hot reloading in development

### Data Models
- **Recipe Schema**: Comprehensive recipe structure with ingredients, instructions, metadata
- **User Schema**: Basic user model (defined but not actively used)
- **Request Schemas**: Validation schemas for recipe generation requests

## Data Flow

1. **Recipe Generation Flow**:
   - User inputs ingredients and preferences in IngredientInput component
   - Frontend calls OpenAI API directly (client-side integration)
   - Generated recipes are stored in component state and localStorage
   - Recipes display in RecipeCard components with favorite functionality

2. **Local Storage**:
   - Saved recipes persist in browser localStorage
   - Favorite status toggles update localStorage immediately
   - No backend persistence currently implemented

3. **State Management**:
   - TanStack Query manages API calls and caching
   - Local React state handles UI interactions
   - Toast notifications provide user feedback

## External Dependencies

### AI Integration
- **OpenAI API**: GPT-4o model for recipe generation
- **Configuration**: API key via environment variables (VITE_OPENAI_API_KEY)
- **Client-side calls**: Direct browser-to-OpenAI communication

### Database Setup
- **Drizzle ORM**: Configured for PostgreSQL
- **Neon Database**: Connection string via DATABASE_URL environment variable
- **Migrations**: Schema defined in shared/schema.ts, migrations in ./migrations

### UI Dependencies
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Tailwind CSS**: Utility-first styling
- **Class Variance Authority**: Component variant management

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to dist/public
2. **Backend Build**: esbuild bundles server code to dist/index.js
3. **Production**: Single Node.js process serves both API and static files

### Environment Configuration
- **Development**: tsx for TypeScript execution, Vite dev server
- **Production**: Compiled JavaScript with NODE_ENV=production
- **Database**: PostgreSQL connection via DATABASE_URL
- **API Keys**: OpenAI API key for recipe generation

### Development Features
- **Hot Reloading**: Vite integration with Express server
- **Error Overlay**: Runtime error modal for development
- **Logging**: Request/response logging with timing information
- **TypeScript**: Full type safety across frontend and backend

The application is architected as a modern full-stack TypeScript application with a focus on AI-powered recipe generation, featuring a polished UI and room for future database integration and user management features.