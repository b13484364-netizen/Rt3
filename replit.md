# Overview

This is an Arabic RTL (Right-to-Left) chat application that allows users to create temporary image-based chat rooms. Users can join rooms by selecting or uploading an image and setting a password. The application features real-time messaging with user presence indicators, room timers, and automatic cleanup of expired rooms.

The system is built as a full-stack web application with a React frontend and Express.js backend, designed for temporary anonymous conversations around shared images.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development tooling
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Arabic/RTL support and chat-specific color scheme
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Language Support**: Arabic RTL layout with Cairo font family

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Storage**: In-memory storage implementation with interface for future database integration
- **Authentication**: Password-based room access with bcrypt hashing
- **File Handling**: Multer for image uploads with 5MB size limit and image type validation

## Data Storage Solutions
- **Current Implementation**: In-memory storage using Maps for rooms, messages, and users
- **Database Ready**: Drizzle ORM configured for PostgreSQL with Neon serverless driver
- **Schema Design**: 
  - Rooms table with image references, password hashes, and expiration times
  - Messages table with user information and timestamps
  - Room users table for presence tracking
- **Data Persistence**: Automatic cleanup of expired rooms every minute

## Authentication and Authorization
- **Room Access Control**: Password-based authentication with bcrypt hashing
- **Session Management**: Local storage for client-side session persistence
- **User Identity**: UUID-based temporary user identification
- **Room Ownership**: Creator privileges for room management and closure

## External Dependencies
- **Neon Database**: Serverless PostgreSQL for production data storage
- **Unsplash**: Image service for predefined room backgrounds
- **Replit Services**: Development environment integration with cartographer plugin
- **Node.js Ecosystem**: 
  - bcrypt for password hashing
  - multer for file uploads
  - connect-pg-simple for PostgreSQL session store
  - Various Radix UI components for accessible interface elements

The application uses polling for real-time updates rather than WebSockets, making it suitable for serverless deployment environments. The modular storage interface allows easy migration from in-memory to database persistence.