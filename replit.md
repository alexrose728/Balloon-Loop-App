# Balloon Loop

## Overview

Balloon Loop is a cross-platform mobile application built with React Native and Expo that allows users to discover, create, and save balloon arch listings. The app features a location-based discovery system with map and list views, user-generated content with images, and a favorites system. The architecture follows a monorepo pattern with a React Native frontend and Express.js backend, sharing types and schemas between client and server.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation with native stack and bottom tabs
  - Tab-based main navigation (Explore, Search, Favorites, Profile)
  - Stack navigation for detail screens and modals
  - Floating Action Button for creating listings
- **State Management**: 
  - React Query for server state and data fetching
  - React Context for auth and listing state
- **Styling**: StyleSheet with a custom theme system supporting light/dark modes
- **Animations**: React Native Reanimated for smooth micro-interactions

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **API Design**: RESTful endpoints under `/api/` prefix
- **Data Validation**: Zod schemas generated from Drizzle schemas

### Data Model
The database has three main tables:
- **users**: Basic user accounts with username/password
- **listings**: Balloon arch entries with title, description, event type, colors, images, location coordinates, and creator info
- **favorites**: Junction table linking users to their favorited listings

### Path Aliases
- `@/` maps to `./client/` for frontend code
- `@shared/` maps to `./shared/` for shared schemas and types

### Key Design Patterns
- **Shared Schema**: Drizzle schemas in `/shared/schema.ts` are used by both client and server, with Zod schemas derived for validation
- **Platform-specific Components**: `.native.tsx` suffix for React Native-specific implementations (e.g., MapViewWrapper)
- **Error Boundaries**: Class component error boundary with dev-mode error details
- **Keyboard Handling**: Platform-aware keyboard scroll views using `react-native-keyboard-controller`

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, configured via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries with auto-generated migrations

### Expo Services
- **expo-location**: User location for map centering and nearby discovery
- **expo-image-picker**: Photo selection for listing images
- **expo-image**: Optimized image rendering with caching

### Maps
- **react-native-maps**: Native map component for iOS/Android (falls back gracefully on web/unsupported platforms)

### Authentication (Planned)
- Design guidelines indicate SSO with Apple Sign-In and Google Sign-In should be implemented
- Currently uses mock authentication context

### Third-party UI
- **@expo/vector-icons**: Feather icon set throughout the app
- **expo-blur/expo-glass-effect**: Blur effects for headers and overlays