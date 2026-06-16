# Storefront Development (`src/app/[domain]`)

This directory contains the logic for the tenant-facing storefronts.

## Domain Routing
- Every route within this folder receives a `domain` param (e.g., `params: { domain: string }`).
- The `domain` corresponds to the `subdomain` or `customDomain` field in the Prisma `Store` model.

## Data Fetching
- Always fetch the store context first based on the domain.
- Use the `@/lib/prisma` client for data fetching.

## UI Styling
- Storefronts may have dynamic themes. Refer to the `Store` model's `themeConfig` (Json field).
- Use Tailwind CSS with dynamic values or CSS variables where possible to respect tenant configurations.
