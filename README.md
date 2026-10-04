# AI Political Poster Maker — Frontend

Next.js 16 client for the AI Political Poster Maker. Consumes the Express API in `../backend/`. Provides a complete user workflow — register, create posters with photos and Bangla text, watch the AI compose them, download print-ready PNGs — plus a full admin panel for template management and content moderation.

**Backend repo:** `../backend/` (Express + Prisma + Puppeteer + Gemini + Cloudinary)

**Live deployment:** https://your-frontend.vercel.app

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture](#architecture)
3. [Folder Structure](#folder-structure)
4. [Environment Variables](#environment-variables)
5. [Local Setup](#local-setup)
6. [Routes](#routes)
7. [Components](#components)
8. [Hooks](#hooks)
9. [API Client](#api-client)
10. [Auth Flow](#auth-flow)
11. [Poster Creation Flow](#poster-creation-flow)
12. [Admin Flow](#admin-flow)
13. [Design System](#design-system)
14. [shadcn/ui + Base UI Notes](#shadcnui--base-ui-notes)
15. [Responsive Behavior](#responsive-behavior)
16. [Known Limitations](#known-limitations)
17. [Future Roadmap](#future-roadmap)
18. [Scripts](#scripts)
19. [Deployment](#deployment)

---

## Tech Stack

| Layer | Technology | Notes |
| :--- | :--- | :--- |
| Framework | Next.js 16 (App Router) | Server + client components |
| Language | TypeScript 5.9+ | Strict mode |
| Styling | Tailwind CSS v4 | No `tailwind.config.js` — config in `globals.css` |
| UI Kit | shadcn/ui (Base UI) | Copy-in components, fully editable |
| Icons | lucide-react | |
| Data Fetching | TanStack React Query v5 | Polling, caching, mutations |
| Forms | React Hook Form + Zod | Shared validation with backend |
| Toasts | Sonner | Via shadcn wrapper |
| Fonts | `next/font/local` | Bangla fonts bundled locally |
| Package Manager | Bun | |
| Runtime | Node.js 24+ | |

---

## Architecture

### Two independent projects

```
poster-maker/
├── backend/    ← Express API (separate project)
└── frontend/   ← Next.js client (this project)
```

The frontend **never imports from the backend**. They communicate exclusively over `HTTP + JSON` using the API contract defined in `src/types/api.ts`.

### App Router layout

```
src/app/
├── layout.tsx                       ← Root: fonts + providers
├── page.tsx                         ← Landing (public marketing)
├── globals.css
├── (auth)/                          ← Auth route group
│   ├── layout.tsx                   ← Navbar + centered form
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/                     ← User route group
│   ├── layout.tsx                   ← Auth guard + app shell
│   ├── dashboard/page.tsx
│   ├── create/page.tsx
│   ├── preview/[id]/page.tsx
│   └── history/page.tsx
└── admin/                           ← Admin route group
    ├── layout.tsx                   ← Role guard + dark sidebar
    ├── page.tsx                     ← Redirect → /admin/templates
    ├── templates/page.tsx
    └── posters/page.tsx
```

**Route groups `(auth)` and `(dashboard)`** don't appear in URLs — they let each group define its own layout. `(dashboard)/layout.tsx` guards all its children with auth. `admin/layout.tsx` additionally checks `user.role === "ADMIN"`.

### Data flow

```
Browser
  │  fetch(credentials: "include")
  ▼
Next.js + React Query cache
  │
  │  hooks: useAuth, useTemplates, usePosters, useAdmin
  ▼
src/lib/api.ts  (fetch wrapper + typed endpoints)
  │
  │  HTTP + httpOnly cookies
  ▼
Express API (localhost:5000 or deployed backend)
```

React Query handles:
- Caching (`staleTime: 60s` on most queries, 5 min on auth/templates)
- Polling (`refetchInterval: 2000` while poster status is `GENERATING`, auto-stops after 60s)
- Mutations + cache invalidation
- Placeholder data during pagination

---

## Folder Structure

```
frontend/
├── public/
│   └── fonts/                       # Bangla fonts (AnekBangla, HindSiliguri, ...)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx           # Auth guard + navbar + sheet menu
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── create/page.tsx      # Poster form
│   │   │   ├── preview/[id]/page.tsx
│   │   │   └── history/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx           # ADMIN guard + sidebar
│   │   │   ├── page.tsx             # redirect → /admin/templates
│   │   │   ├── templates/page.tsx
│   │   │   └── posters/page.tsx
│   │   ├── fonts.ts                 # next/font/local config
│   │   ├── globals.css              # Tailwind v4 + theme tokens
│   │   ├── layout.tsx               # Root layout + Providers
│   │   └── page.tsx                 # Landing page
│   ├── components/
│   │   ├── admin/
│   │   │   └── TemplateFormDialog.tsx
│   │   ├── marketing/
│   │   │   └── Navbar.tsx
│   │   ├── poster/
│   │   │   ├── PhotoUploader.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── TemplatePicker.tsx
│   │   ├── ui/                      # shadcn components (yours to edit)
│   │   │   ├── alert.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── tooltip.tsx
│   │   └── providers.tsx            # React Query + Toaster
│   ├── hooks/
│   │   ├── useAdmin.ts
│   │   ├── useAuth.ts
│   │   ├── usePosters.ts
│   │   └── useTemplates.ts
│   ├── lib/
│   │   ├── api.ts                   # fetch wrapper + typed endpoints
│   │   ├── query-client.ts          # React Query config
│   │   └── utils.ts                 # cn() helper
│   └── types/
│       └── api.ts                   # Shared API types
├── .env.local                       # Local secrets (not committed)
├── .env.example
├── components.json                  # shadcn config
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Environment Variables

### `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### `.env.example`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

| Variable | Required | Default | Notes |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Yes | — | Base URL of the backend API. Must include `/api/v1`. **No trailing slash.** |

**Production:** on Vercel, set `NEXT_PUBLIC_API_URL` to your Render deployment URL:

```env
NEXT_PUBLIC_API_URL=https://poster-maker-api.onrender.com/api/v1
```

---

## Local Setup

**Prerequisite:** backend must be running on `http://localhost:5000`.

```bash
# 1. Install
cd frontend
bun install

# 2. Configure
cp .env.example .env.local
# (default is fine for local dev)

# 3. Verify
bun run typecheck

# 4. Run
bun dev
# → ▲ Next.js ready on http://localhost:3000
```

Open `http://localhost:3000`.

### Promote yourself to admin

```bash
cd ../backend
bun run promote-admin you@example.com
```

Then log out and log back in — you'll be redirected to `/admin/templates`.

---

## Routes

| Path | Access | Purpose |
| :--- | :--- | :--- |
| `/` | Public | Marketing landing page |
| `/login` | Public (redirects if logged in) | Login form |
| `/register` | Public (redirects if logged in) | Registration form |
| `/dashboard` | Auth | Post-login home with quick actions |
| `/create` | Auth | Poster creation form |
| `/preview/[id]` | Auth (owner) | Live preview + regenerate + download |
| `/history` | Auth | Paginated list of past posters |
| `/admin` | Auth (ADMIN) | Redirects to `/admin/templates` |
| `/admin/templates` | Auth (ADMIN) | Template CRUD |
| `/admin/posters` | Auth (ADMIN) | Moderation queue |

**Guards:**
- `(dashboard)/layout.tsx` — redirects to `/login?next=<path>` if no user
- `admin/layout.tsx` — redirects to `/login?next=<path>` if no user; redirects to `/dashboard` if `role !== "ADMIN"`
- `useLogin()` — after successful auth, respects `?next=` param, otherwise redirects by role (`ADMIN` → `/admin/templates`, `USER` → `/dashboard`)

---

## Components

### `src/components/marketing/`

| Component | Purpose |
| :--- | :--- |
| `Navbar.tsx` | Shared marketing navbar with logo, nav links, auth-aware CTAs, mobile sheet menu. Shows an **Admin** button when `user.role === "ADMIN"`. |

### `src/components/poster/`

| Component | Purpose |
| :--- | :--- |
| `TemplatePicker.tsx` | Grid of selectable template cards with occasion labels. Enforces selection with a ring. |
| `PhotoUploader.tsx` | Drag-and-drop uploader with thumbnails, per-file validation (JPG/PNG/WebP, max 5 MB), remove buttons, dynamic max from the selected template's photo slots. |
| `StatusBadge.tsx` | Color-coded poster status pill (`GENERATING` / `COMPLETED` / `FAILED` / `DRAFT`). |

### `src/components/admin/`

| Component | Purpose |
| :--- | :--- |
| `TemplateFormDialog.tsx` | Create/edit template dialog. Includes a JSON editor for `layoutConfig` with live validation, pre-filled defaults per HTML template key. |

### `src/components/ui/`

Every component here is a **shadcn copy-in** — you own the code. Edit freely. Do not treat them as a black-box library.

| Component | Used For |
| :--- | :--- |
| `alert` | Error banners in preview |
| `alert-dialog` | Delete confirmation, deactivate confirmation |
| `avatar` | User initial in header |
| `badge` | Status pills, occasion labels |
| `button` | Everywhere |
| `card` | Form sections, dashboard tiles, history cards |
| `dialog` | Template form dialog, flag dialog |
| `dropdown-menu` | User menu in dashboard + admin header |
| `input` / `textarea` | Form fields |
| `label` | Form labels |
| `select` | Occasion, HTML template pickers in admin form |
| `separator` | Dividers |
| `sheet` | Mobile nav drawer |
| `skeleton` | Loading placeholders |
| `sonner` | Toast host |
| `switch` | Active toggle in template form |
| `table` | Admin templates + moderation queue |
| `tabs` | Flagged / All tabs on moderation page |
| `tooltip` | Button hints |

---

## Hooks

All hooks live in `src/hooks/` and are `"use client"`.

### `useAuth.ts`

| Hook | Returns | Notes |
| :--- | :--- | :--- |
| `useAuth()` | `{ data: User \| null, isLoading }` | 401 → `null`. Cached 5 min. |
| `useLogin()` | Mutation | Sets cache, redirects by role or `?next=` |
| `useRegister()` | Mutation | Same, always redirects to `/dashboard` |
| `useLogout()` | Mutation | Clears cache, redirects to `/login` |

### `useTemplates.ts`

| Hook | Returns | Notes |
| :--- | :--- | :--- |
| `useTemplates(occasion?)` | List of templates | Optional filter. Cached 5 min. |
| `useTemplate(id)` | Detail of one template | Enabled only when `id` present |

### `usePosters.ts`

| Hook | Returns | Notes |
| :--- | :--- | :--- |
| `usePoster(id)` | Detail with polling | Polls every 2s while `GENERATING`. **Stops after 60s**. |
| `usePosterHistory(page, limit)` | `{ posters, meta }` | Keeps previous data while loading next page |
| `useCreatePoster()` | Mutation | Invalidates history, returns `posterId` |
| `useRegeneratePoster(id)` | Mutation | Invalidates detail |
| `useDeletePoster()` | Mutation | Invalidates entire history |
| `useUploadPhoto()` | Mutation | Wraps `uploadApi.uploadPhoto` |

### `useAdmin.ts`

| Hook | Returns | Notes |
| :--- | :--- | :--- |
| `useAdminTemplates()` | List of all templates (including inactive) | Includes `_count.posters` |
| `useCreateTemplate()` | Mutation | Invalidates admin template list |
| `useUpdateTemplate()` | Mutation | |
| `useDeactivateTemplate()` | Mutation | Soft-delete (`isActive = false`) |
| `useAdminPosters({ flagged, page, limit })` | Paginated posters with `user` + `template` joined | |
| `useSetPosterFlag()` | Mutation | Toggle flag with optional reason |
| `useAdminDeletePoster()` | Mutation | Invalidates both admin and user poster caches |

---

## API Client

`src/lib/api.ts` is the **only** place that calls `fetch`. Every hook goes through it.

### Design

```ts
async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T; meta?: Meta }> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",   // ← sends httpOnly cookies
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });
  // ...
}
```

**Two critical details:**

1. **`credentials: "include"`** — without this, the browser strips cookies on cross-origin calls. Localhost:3000 → localhost:5000 is cross-origin. Deployed frontend → deployed backend is cross-site.
2. **Don't set `Content-Type` manually for `FormData` uploads** — the browser sets it with the correct multipart boundary.

### Exported API groups

| Group | Methods |
| :--- | :--- |
| `authApi` | `register`, `login`, `me`, `logout`, `refresh` |
| `templateApi` | `list`, `getById` |
| `uploadApi` | `uploadPhoto(file)` |
| `posterApi` | `create`, `getById`, `history`, `regenerate`, `delete` |
| `adminApi` | `listTemplates`, `createTemplate`, `updateTemplate`, `deactivateTemplate`, `listPosters`, `setPosterFlag`, `deletePoster` |

### Error handling

Errors are thrown as `HttpError` with `.status`, `.message`, and `.body`. Consumers either show a toast (via `onError` in mutations) or catch explicitly (e.g., `useAuth` catches 401 → returns `null`).

---

## Auth Flow

```
1. User submits /register or /login form
       │
       ▼
2. useLogin / useRegister mutation
       │
       ▼
3. POST /auth/{login|register}  (credentials: include)
       │
       ▼
4. Backend sets two httpOnly cookies:
     accessToken   (path /, 1 day)
     refreshToken  (path /api/v1/auth, 7 days)
       │
       ▼
5. React Query caches the returned user in AUTH_QUERY_KEY
       │
       ▼
6. Redirect:
     - ?next= param present → navigate there
     - Else role === "ADMIN" → /admin/templates
     - Else → /dashboard
       │
       ▼
7. On every protected page, useAuth() calls GET /auth/me
     → backend verifies cookie, returns user
     → if 401, returns null → layout redirects to /login?next=<path>
```

**No tokens are stored in localStorage or memory.** All auth state lives in httpOnly cookies managed by the browser.

### Refresh strategy

The backend issues short-lived access tokens (1 day). When they expire, the client receives a 401. For the MVP:

- The user is redirected to `/login`
- They log in again

**Future improvement:** intercept 401 in `request()` and call `/auth/refresh` before retrying the original request.

---

## Poster Creation Flow

```
/create
   │
   ├─ 1. User picks a template
   │      → useTemplates() populates the grid
   │      → useTemplate(id) fetches photoSlots count → drives PhotoUploader max
   │
   ├─ 2. User fills Bangla text fields (headline, name, designation, party, ...)
   │      → react-hook-form + zod validates locally
   │
   ├─ 3. User uploads photos (drag or click)
   │      → each file → POST /upload → Cloudinary URL stored in state
   │      → thumbnails shown with remove buttons
   │
   └─ 4. Submit
          → POST /posters (202 Accepted) with templateId + formData + photoUrls
          → redirect to /preview/<posterId>

/preview/<id>
   │
   ├─ usePoster(id) starts polling (every 2s while status === "GENERATING")
   │
   ├─ Backend runs async job:
   │     Gemini → layout JSON
   │     Puppeteer → PNG
   │     Cloudinary → URL
   │     Poster.status = COMPLETED
   │
   ├─ Client sees COMPLETED → shows image
   │
   ├─ Download button → anchor with download attribute
   │
   └─ Regenerate button (up to 3×)
          → POST /posters/:id/regenerate
          → polling restarts
```

**Polling safety net:** `usePoster` stops polling after 60 seconds to avoid runaway requests on a stuck job.

---

## Admin Flow

```
/login (as ADMIN)
   │
   ▼
Redirect to /admin/templates
   │
   ▼
/admin/layout.tsx verifies user.role === "ADMIN"
   │
   ├─ Templates tab (/admin/templates)
   │     → Table: title, slug, occasion, HTML key, poster count, active status
   │     → "New template" button → dialog with JSON layout editor
   │     → Pencil icon → edit existing
   │     → Power icon → confirm deactivate (soft delete)
   │
   └─ Moderation tab (/admin/posters)
         → Tabs: "Flagged" / "All posters"
         → Table: image thumb, headline, user, template, status, flag state
         → Flag icon → dialog with optional reason
         → FlagOff icon → unflag immediately
         → Trash icon → confirm hard delete
         → External link icon → open Cloudinary image in new tab
```

### Access model

| Role | `/dashboard/*` | `/admin/*` |
| :--- | :--- | :--- |
| Guest | Redirect → `/login?next=<path>` | Redirect → `/login?next=<path>` |
| USER | ✅ | Redirect → `/dashboard` |
| ADMIN | ✅ | ✅ |

Admins see an **Admin** button in the navbar and an **Admin panel** link in the user dropdown.

---

## Design System

### Theme

Defined entirely in `src/app/globals.css` via Tailwind v4's `@theme inline` directive. No `tailwind.config.js`.

**Primary color:** emerald green (`oklch(0.45 0.13 160)`) — matches the political poster palette and Bangladesh's flag.

**Accent:** warm red (`oklch(0.93 0.03 25)`) — for destructive actions and highlights.

**Neutral base:** near-white background, near-black foreground, muted grays.

**Dark mode:** tokens defined under `.dark` but no toggle is wired yet. The admin panel uses a slate-900 top bar intentionally, independent of the theme toggle.

### Fonts

Two Bangla fonts bundled via `next/font/local`:

| Font | Variable | Used For |
| :--- | :--- | :--- |
| Anek Bangla ExtraBold | `--font-headline` | Headlines, brand wordmark, template titles |
| Hind Siliguri Regular | `--font-body` | All body text |

Referenced via Tailwind arbitrary values:

```tsx
<span className="font-[family-name:var(--font-headline)]">মহান বিজয় দিবস</span>
```

The same fonts are bundled on the backend for Puppeteer rendering, so the UI preview matches the final poster.

### Spacing + Radius

- Container: `max-w-6xl mx-auto px-4`
- Card radius: `rounded-xl` (from `--radius: 0.75rem`)
- Vertical rhythm: `space-y-6` or `space-y-8` between sections

### Utility — `cn()`

`src/lib/utils.ts` exports the standard `clsx` + `tailwind-merge` helper:

```ts
import { cn } from "@/lib/utils";

<div className={cn("base-class", condition && "conditional-class")} />
```

---

## shadcn/ui + Base UI Notes

**Important:** as of July 2026, shadcn/ui defaults to **Base UI** instead of Radix UI. This affects how composition props work.

### The `render` prop (Base UI) vs `asChild` (Radix)

**Radix:**
```tsx
<Button asChild>
  <Link href="/dashboard">Dashboard</Link>
</Button>
```

**Base UI:**
```tsx
<Button render={<Link href="/dashboard" />} nativeButton={false}>
  Dashboard
</Button>
```

**Rules:**

| Rendered element | `nativeButton` |
| :--- | :--- |
| Real `<button>` | Omit (default `true`) |
| `<Link>`, `<a>`, `<span>`, `<div>` | **Must be `false`** |

If you forget `nativeButton={false}`, Base UI logs:
> *"A component that acts as a button expected a native `<button>`..."*

### Groups are required for labels

`DropdownMenuLabel` (and `SelectLabel`, etc.) must be wrapped in a `DropdownMenuGroup`. Otherwise:
> *"MenuGroupContext is missing."*

```tsx
<DropdownMenuContent>
  <DropdownMenuGroup>
    <DropdownMenuLabel>Account</DropdownMenuLabel>
  </DropdownMenuGroup>
  <DropdownMenuSeparator />
  <DropdownMenuItem>Log out</DropdownMenuItem>
</DropdownMenuContent>
```

### Triggers replacing their children

`SheetTrigger`, `DialogTrigger`, `DropdownMenuTrigger` — all accept `render`. Use it to swap the default trigger element:

```tsx
<SheetTrigger
  render={
    <Button variant="ghost" size="icon">
      <Menu className="h-5 w-5" />
    </Button>
  }
/>
```

**Do not** nest a `<Button>` inside a trigger that already renders a `<button>`. That produces `<button><button>...` which fails HTML validation and hydration.

---

## Responsive Behavior

| Breakpoint | Behavior |
| :--- | :--- |
| `<640px` (mobile) | Navbar collapses to hamburger + sheet. Create form single column. Template picker 2-col. History 1-col. Preview stacks. Admin sidebar becomes a sheet. |
| `640–1024px` (tablet) | Template picker 3-col. History 2-col. Preview still stacks. |
| `>1024px` (desktop) | Create + preview get a sticky right sidebar. History 3-col. Admin sidebar is persistent. |

Key responsive classes used throughout:

```tsx
// Sidebar becomes a column below lg
<div className="grid gap-6 lg:grid-cols-[1fr_360px]">

// Sticky sidebar on desktop
<div className="lg:sticky lg:top-24 lg:self-start">
```

---

## Known Limitations

### Deferred to Phase 2

| Feature | Status |
| :--- | :--- |
| Dark mode toggle | Tokens exist, no UI switch |
| PDF export button | Backend supports it, no frontend wiring |
| Bulk CSV generation | Not started |
| Payment gateway (bKash/Nagad) | Not started |
| Bangla font picker for users | Not started |
| OTP / phone login | Not started |
| Usage analytics dashboard | Not started |

### Technical

1. **No automatic token refresh.** When the 1-day access token expires, the user is redirected to `/login` (with `?next=` preserved). A refresh interceptor is a Phase 2 task.

2. **No optimistic updates.** Creating a poster navigates immediately after the 202 response; the preview page shows a spinner while polling. This is fine — the alternative (fake preview) would be misleading.

3. **Images loaded from Cloudinary without `next/image`.** We use plain `<img>` because Cloudinary already serves optimized assets. If you want Next's image optimization, add `images.remotePatterns` in `next.config.ts` and swap the tags.

4. **Download relies on `a[download]`.** Some browsers ignore the `download` attribute for cross-origin URLs (Cloudinary). The image opens in a new tab instead of downloading directly. To force download, proxy through the backend or use Cloudinary's `fl_attachment` transformation.

5. **Polling stops at 60 seconds.** If a poster is stuck `GENERATING` longer (backend bug), the UI keeps showing the spinner but stops polling.

6. **No error boundaries.** A render error in a route crashes the whole route group. Add `error.tsx` files in Phase 2.

7. **Admin layout has its own styling.** The admin top bar is intentionally dark slate, distinct from the user app's white navbar. This is a design choice, not a theme inconsistency.

### Accessibility gaps

- Template picker cards are `<button>` elements with no `aria-pressed` state — the visual ring indicates selection but screen readers don't announce it.
- Photo uploader drop zone has no keyboard-focusable activation (the "browse" link inside is focusable, but the drop area itself isn't).
- No `<label>` associated with the photo input.
- Admin flag dialog reason field has no `aria-describedby` for the helper text.

These are acceptable for MVP but should be addressed before any public release.

---

## Future Roadmap

### Phase 10 — Polish

- Token refresh interceptor in `api.ts`
- Dark mode toggle (tokens already defined)
- `next/image` for Cloudinary URLs
- Skeleton loaders for auth pages
- Error boundaries per route group
- `aria-pressed` on template cards
- Keyboard activation for photo drop zone

### Phase 2 (per PRD)

- PDF export button
- Watermark tier display (FREE vs PREMIUM)
- Bulk CSV generation UI
- Bangla font picker
- Payment flow (bKash/Nagad)
- Usage analytics dashboard

---

## Scripts

| Command | Purpose |
| :--- | :--- |
| `bun dev` | Start dev server on port 3000 |
| `bun run build` | Production build |
| `bun start` | Run production build |
| `bun run lint` | ESLint |
| `bun run typecheck` | `tsc --noEmit` — verify types |

### shadcn commands

```bash
# Add a new component
bunx shadcn@latest add <component-name>

# Overwrite an existing component (re-install latest from shadcn)
bunx shadcn@latest add <component-name> --overwrite

# Add a whole batch
bunx shadcn@latest add table tabs progress alert alert-dialog
```

### Useful debugging

```bash
# Find every use of a specific prop or pattern
grep -rn "asChild" src/
grep -rn "render={<" src/
grep -rn "nativeButton" src/
```

---

## Deployment

### Vercel

1. Push `frontend/` to a Git repository
2. Import into Vercel
3. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
   ```
4. Deploy

**⚠️ Critical:** the backend must have `CLIENT_ORIGIN` set to **exactly** your Vercel domain:

```
CLIENT_ORIGIN=https://your-frontend.vercel.app
```

No trailing slash. No `*`. Otherwise, cookies will be rejected and auth will fail silently.

### Verifying deployment

After deploying, confirm in the browser:

1. Register a new account → cookies set in DevTools
2. Refresh the page → still logged in
3. Create a poster → reaches `COMPLETED` and shows the image
4. Log out → cookies cleared, redirected to `/login`

If cookies don't stick, check:

- `NEXT_PUBLIC_API_URL` points to the deployed backend (not `localhost`)
- Backend `CLIENT_ORIGIN` matches the Vercel URL exactly
- Backend `NODE_ENV=production` (so cookies are `secure: true` + `sameSite: "none"`)
- Backend CORS has `credentials: true`

---

## License

Internal project. Bangla fonts bundled under SIL OFL. shadcn components are MIT-licensed and copied into `src/components/ui/`.

---

## Contributors

Built during the Oct 2026 SDLC sprint as a two-project deliverable. See `../backend/README.md` for the API contract and generation pipeline details.