# Quadlix: AI E-commerce SaaS

Multi-tenant AI-driven E-commerce platform built with Next.js, Prisma, and Supabase.

## Architecture

- **Multi-tenancy:** Subdomain-based routing.
  - SaaS Dashboard: `app.quadlix.com` or root domain.
  - Storefronts: `[subdomain].quadlix.com` (handled via `src/app/[domain]`).
- **Frontend:** Next.js App Router (Note: Version 16+ with breaking changes), React 19, Tailwind CSS 4.
- **UI Components:** `shadcn/ui` with Lucide icons and Framer Motion for animations.
- **Backend/Database:** Prisma ORM with PostgreSQL (hosted on Supabase).
- **Authentication & Storage:** Supabase (SSR).
- **AI Integration:** Vercel AI SDK, Google Generative AI, OpenAI, and Replicate.

## Key Directories

- `src/app/dashboard`: Administrative interface for store owners.
- `src/app/[domain]`: Dynamic storefront routes for tenants.
- `src/components/ui`: Base UI components (shadcn/ui).
- `src/lib`: Core utility functions and Prisma client.
- `src/utils/supabase`: Supabase client configurations for server, client, and middleware.

## Development Workflows

### Database Management
- **Schema Changes:** Update `prisma/schema.prisma`.
- **Syncing:** Use `npx prisma db push` for local/dev synchronization.
- **Client Generation:** Run `npx prisma generate` after schema updates.
- **Direct Connection:** Terminal commands use `DIRECT_URL` (Supabase port 5432) to avoid connection pooling issues.

### Authentication
- Use `@/utils/supabase/server.ts` for Server Components and Actions.
- Use `@/utils/supabase/client.ts` for Client Components.
- Middleware (`src/middleware.ts`) handles session updates and multi-tenant rewrites.

### UI & Styling
- **Tailwind 4:** Use modern CSS variables and `@theme` directives in `src/app/globals.css`.
- **Theme-Awareness (Light/Dark Mode):** 
  - Never use hardcoded hex colors or arbitrary static backgrounds (`bg-[#040408]`, `rgba(255,255,255,0.05)`) for general UI elements.
  - Exclusively use semantic Tailwind classes: `bg-background`, `bg-card`, `bg-secondary`, `text-foreground`, `text-muted-foreground`, and `border-border`.
  - When configuring inline styles or dynamic components (like the `PreviewRenderer`), use `color: "currentColor"` and `opacity` to ensure text inherits visibility properly across dynamic backgrounds.
  - The project uses `next-themes`. Access the active theme via `useTheme()` and implement manual toggles using the `ThemeToggle` component in `@/components/theme-toggle.tsx`.
- **Components:** Always check `@/components/ui` for existing components before creating new ones.
- **Icons:** Use `lucide-react`.

## Coding Conventions

- **Server-First:** Prefer Server Components and Server Actions for data fetching and mutations.
- **Type Safety:** Use Zod for validation, especially in Server Actions.
- **Naming:**
  - Files: `kebab-case.tsx`
  - Components: `PascalCase`
  - Functions: `camelCase`
- **File Structure:** Group related actions and components within their respective route directories (e.g., `src/app/dashboard/products/actions.ts`).

## Subdirectory Instructions

- [src/app/[domain]/GEMINI.md](src/app/%5Bdomain%5D/GEMINI.md): Instructions for storefront development.
- [src/app/dashboard/GEMINI.md](src/app/dashboard/GEMINI.md): Instructions for admin dashboard development.
