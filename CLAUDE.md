# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive digital platform for economic inclusion in Côte d'Ivoire, designed to modernize informal sector commerce through a multi-tenant application. The platform serves four main user types: producers, merchants, cooperatives, and administrators, with a marketplace for transactions.

## Development Commands

### Core Development
- `npm run dev` - Start Vite dev server on localhost:8080
- `npm run build` - Production build to `dist/`
- `npm run build:dev` - Development build (useful for QA)
- `npm run preview` - Serve built app locally
- `npm run lint` - Run ESLint checks

### Testing (Vitest + React Testing Library)
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI interface
- `npm run test:coverage` - Run tests with coverage report
- Test setup: `src/setupTests.ts` extends jest-dom matchers

### Requirements
- Node 18+ (npm preferred - avoid mixing with Bun)
- Modern browser for development

## Architecture & Structure

### Core Stack
- **Frontend**: React 18.3.1 + TypeScript + Vite
- **Routing**: React Router DOM v6.30.1
- **State Management**: React Context + TanStack Query v5.83.0
- **UI**: Tailwind CSS + shadcn/ui + Radix UI primitives
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts v2.15.4
- **Testing**: Vitest + React Testing Library + jsdom

### Project Structure
```
src/
├── components/
│   ├── ui/           # shadcn/ui components (70+ components)
│   └── auth/         # Authentication components
├── pages/
│   ├── admin/        # Admin dashboard and management
│   ├── merchant/     # Merchant dashboard and sales
│   ├── producer/     # Producer management
│   ├── cooperative/  # Cooperative management
│   ├── marketplace/  # Marketplace interface
│   ├── disputes/     # Dispute resolution
│   ├── reviews/      # Review system
│   ├── auth/         # Authentication pages
│   └── user/         # User preferences and features
├── contexts/         # React contexts (Auth, Cart, Order, Review, etc.)
├── services/         # API services organized by domain
├── hooks/            # Custom React hooks
├── lib/              # Utilities and helper functions
└── types/            # TypeScript type definitions
```

### Key Features by User Role

#### Merchants (`/merchant/*`)
- Dashboard with sales analytics
- Inventory management with alerts
- Sales workflow and order management
- Payment processing
- Mobile-optimized interface

#### Producers (`/producer/*`)
- Production management and planning
- Harvest tracking
- Price management
- Order management
- Vocal interface support

#### Cooperatives (`/cooperative/*`)
- Member management
- Order aggregation and negotiation
- Inventory and warehouse management
- Financial tracking and subsidies
- Distribution planning

#### Administrators (`/admin/*`)
- System monitoring and health
- User management and permissions
- Financial oversight
- Marketplace management
- Audit logging and security

#### Marketplace (`/marketplace`)
- Public marketplace interface
- Product comparison and recommendations
- Review system
- Advanced search and filtering

### Context Providers
The application uses multiple context providers:
- `AuthProvider` - Authentication and role-based access
- `CartProvider` - Shopping cart functionality
- `OrderProvider` - Order management
- `ReviewProvider` - Review system
- `UserPreferencesProvider` - User preferences and localization
- `NotificationProvider` - Push notifications and alerts

### Protected Routes
Routes use `ProtectedRoute` component with role-based access control:
- Admin-only routes: `/admin/*`
- Role-specific routes: `/producer/*`, `/merchant/*`, `/cooperative/*`
- User routes: `/user/*` (all authenticated users)

## Coding Standards

### TypeScript & React
- Use TypeScript for all files (`.ts`, `.tsx`)
- Function components with PascalCase naming
- Custom hooks follow `useX` pattern
- Prefer named exports over default exports

### Styling & UI
- Use Tailwind utility classes
- Import from `@/components/ui/` for shadcn components
- Use `cn()` utility from `src/lib/utils.ts` for class merging
- Follow established design patterns from existing components

### Project Conventions
- Path alias: `@` resolves to `src/`
- Component files: `PascalCase.tsx`
- Service organization: `src/services/[domain]/[feature]Service.ts`
- Test files: `*.test.ts` or `*.test.tsx` alongside source files

### Data Flow
- Services handle API calls and data transformation
- Context providers manage global state
- Custom hooks encapsulate component logic
- Components are focused on presentation

## Key Configuration Files

### Build & Development
- `vite.config.ts` - Vite configuration with React SWC, path aliases, and chunk optimization
- `vitest.config.ts` - Testing configuration with jsdom environment and coverage reporting
- `eslint.config.js` - ESLint with TypeScript and React rules (unused vars disabled)

### Styling
- `tailwind.config.ts` - Tailwind CSS with custom colors, gradients, and dark mode
- `components.json` - shadcn/ui component configuration

### TypeScript
- `tsconfig.json` - Base TypeScript configuration
- `tsconfig.app.json` - Application-specific TypeScript settings

## Security Notes

- Environment variables must use `VITE_` prefix
- API keys and secrets should be in `.env.local` (git-ignored)
- Demo credentials in `CREDENTIALS.md` for local testing only
- Role-based access control implemented at route level
- Protected routes use `requiredRoles` array for authorization
- Test credentials: merchant, producer, cooperative, admin roles available

## Mobile Considerations

- Responsive design required for all components
- Mobile-optimized components in `src/components/ui/mobile-*`
- Touch-friendly interfaces with appropriate sizing
- Consider offline functionality for key features
- Vocal interface support for accessibility

## Testing Guidelines

- Use Vitest for unit and integration tests
- React Testing Library for component tests
- Test files should be deterministic
- Mock external services from `src/services/*`
- Coverage reports available with `npm run test:coverage`
- Test files located alongside source files as `*.test.ts` or `*.test.tsx`
- ESLint rule `@typescript-eslint/no-unused-vars` is disabled to allow test variables
- to