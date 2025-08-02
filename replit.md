# ClipNotes AI

## Overview

ClipNotes AI is a full-stack web application that allows users to upload documents (PDF, TXT, Markdown) or paste YouTube video links for AI-powered content analysis. The system uses OpenAI's GPT-4 to generate summaries and answer questions about uploaded content through retrieval-augmented generation (RAG). Built with a React frontend and Express backend, the application provides user authentication, content ingestion, AI analysis, and persistent session history across devices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Single-page application built with Vite
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack React Query for server state, React Context for themes
- **Routing**: Wouter for client-side routing
- **Theme System**: Light/dark mode with system preference detection

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect (Google OAuth)
- **Session Management**: Express sessions with PostgreSQL storage
- **File Processing**: Multer for file uploads with memory storage
- **API Design**: RESTful endpoints with JSON responses

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless
- **Schema Design**: 
  - Users table for authentication (required by Replit Auth)
  - Sources table for uploaded content metadata
  - AI Sessions table for analysis sessions
  - QAs table for question-answer pairs
  - Sessions table for authentication sessions
- **File Storage**: In-memory processing (files not permanently stored)
- **Content Storage**: Extracted text content stored directly in database

### Authentication and Authorization
- **Provider**: Replit Auth with Google OAuth integration
- **Session Management**: Server-side sessions with PostgreSQL store
- **Security**: HTTP-only cookies, secure session configuration
- **User Management**: Automatic user creation/update on login
- **Theme Persistence**: User theme preferences stored in database

### AI Integration Architecture
- **Provider**: OpenAI API using GPT-4 model
- **Content Processing**: 
  - Text extraction from multiple file formats
  - YouTube transcript fetching (configured but not fully implemented)
  - Content chunking and analysis
- **RAG Implementation**: Content analysis with question-answering capabilities
- **Response Format**: JSON-structured responses for summaries and Q&A

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit Auth service with Google OAuth
- **File Processing**: Built-in Node.js modules (no external file processing libs)

### AI Services
- **OpenAI API**: GPT-4 for content analysis, summarization, and question answering
- **Model**: gpt-4o (latest available model)

### Email Services
- **SendGrid**: Automated welcome email system for new user onboarding
- **Configuration**: CEO Shardul Kamble welcome emails

### Frontend Libraries
- **UI Components**: Radix UI primitives (@radix-ui/*)
- **Styling**: Tailwind CSS with PostCSS
- **Icons**: Lucide React icons
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns for formatting

### Development Tools
- **Build System**: Vite for frontend bundling
- **Type Checking**: TypeScript with strict configuration
- **Database Migrations**: Drizzle Kit for schema management
- **Development**: TSX for TypeScript execution

### Third-Party Integrations
- **YouTube Processing**: Planned but not fully implemented (transcript extraction)
- **PDF Processing**: Configured but requires additional setup
- **Email Templates**: Custom HTML email templates for user engagement