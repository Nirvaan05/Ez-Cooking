# Smart Recipe Generator

## Overview

This is a comprehensive recipe generation web application that combines AI-powered recipe creation with a rich database of authentic recipes. Users can input ingredients they have available, specify dietary preferences and cooking time constraints, and receive both AI-generated recipes and authentic dishes from a database of 39,774+ real recipes. The app features a modern React frontend with OpenAI's GPT-4o model for intelligent recipe generation, enhanced by a comprehensive recipe database for authentic culinary inspiration.

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
- **Database**: PostgreSQL with Drizzle ORM (active production database)
- **Storage**: PostgreSQL storage with advanced search capabilities (DatabaseStorage class)
- **Development**: Hot module replacement with Vite integration

## Key Components

### Frontend Components
1. **IngredientInput**: Form component for collecting ingredients and preferences
2. **RecipeCard**: Display component for recipe previews with favorite functionality
3. **RecipeModal**: Detailed recipe view with full instructions and ingredients
4. **DatabaseRecipes**: Component displaying authentic recipes from database with filtering
5. **UI Library**: Complete set of shadcn/ui components (buttons, dialogs, forms, etc.)

### Backend Components
1. **Server Setup**: Express server with middleware for JSON parsing and logging
2. **Storage Interface**: Abstract storage interface with PostgreSQL implementation
3. **Route Registration**: Complete API endpoints for recipe CRUD operations
4. **Database Layer**: Drizzle ORM with optimized queries and search functionality
5. **Development Integration**: Vite middleware for hot reloading in development

### Data Models
- **Recipe Schema**: Comprehensive recipe structure with ingredients, instructions, metadata stored in PostgreSQL
- **User Schema**: User model with favorites relationship (ready for future features)
- **Request Schemas**: Validation schemas for recipe generation requests
- **Database Relations**: User favorites system with proper foreign key relationships

## Data Flow

1. **AI Recipe Generation Flow**:
   - User inputs ingredients and preferences in IngredientInput component
   - Frontend loads recipe database for contextual AI prompting
   - Enhanced prompts sent to OpenAI API with database-inspired context
   - Generated recipes are stored in component state and localStorage
   - Recipes display in RecipeCard components with favorite functionality

2. **Database Recipe Discovery**:
   - Recipe database (39,774+ recipes) loads automatically on app start
   - DatabaseRecipes component shows authentic recipes matching user ingredients
   - Filtering by cuisine type and ingredient matching algorithms
   - Database entries converted to full Recipe format for consistent display

3. **Local Storage**:
   - Saved recipes persist in browser localStorage
   - Favorite status toggles update localStorage immediately
   - Both AI-generated and database recipes can be saved

4. **State Management**:
   - TanStack Query manages API calls and caching
   - Local React state handles UI interactions and database filtering
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