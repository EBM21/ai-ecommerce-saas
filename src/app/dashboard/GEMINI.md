# Admin Dashboard Development (`src/app/dashboard`)

This directory contains the SaaS management interface for store owners.

## Authentication & Authorization
- Protected by Supabase SSR.
- All routes must verify that the user is authenticated.
- Most operations are scoped to the user's `Store`(s).

## Features
- **AI Studio:** Tools for AI-driven image processing and content generation.
- **Analytics:** Store performance metrics.
- **Customizer:** Theme and UI configuration for storefronts.
- **Products:** CRUD operations for store products.
- **Orders:** Order management and tracking.

## UI Patterns
- Uses a sidebar-based layout (`app-sidebar.tsx`).
- Heavy use of `shadcn/ui` components for consistency.
- Forms should use Server Actions with `sonner` for toast notifications.
