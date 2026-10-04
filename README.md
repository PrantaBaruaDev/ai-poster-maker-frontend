# AI Political Poster Maker — Frontend

Next.js 16 client for the AI Political Poster Maker. Consumes the Express API in `../backend/`. Generates print-ready Bangla political posters via a form-driven workflow with live preview polling.

**Backend repo:** [AI Poster Maker Backend Repo](https://github.com/PrantaBaruaDev/ai-poster-maker-backend.git) (Express + Prisma + Puppeteer + Gemini + Cloudinary)

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
12. [Design System](#design-system)
13. [shadcn/ui + Base UI Notes](#shadcnui--base-ui-notes)
14. [Responsive Behavior](#responsive-behavior)
15. [Known Limitations](#known-limitations)
16. [Future Roadmap](#future-roadmap)
17. [Scripts](#scripts)

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
| Forms | React Hook Form + Zod | Shared types with backend |
| Toasts | Sonner | Via shadcn wrapper |
| Fonts | `next/font/local` | Bangla fonts bundled locally |
| Package Manager | Bun | |
| Runtime | Node.js 24+ | |

---

## Architecture

### Two independent projects

```
poster-maker/
├── backend/    ← Express API (this repo's sibling)
└── frontend/   ← Next.js client (this project)
```

The frontend **never imports from the backend**. They communicate exclusively over `HTTP + JSON` using the API contract in `src/types/api.ts`.

### App Router layout

```
src/app/
├── layout.tsx                       ← Root: fonts + providers
├── page.tsx                         ← Landing (public, marketing)
├── globals.css
├── (auth)/                          ← Auth route group
│   ├── layout.tsx                   ← Navbar + centered form
│   ├── login/page.tsx
│   └── register/page.tsx
└── (dashboard)/                     ← Protected route group
    ├── layout.tsx                   ← Auth guard + app shell
    ├── dashboard/page.tsx
    ├── create/page.tsx
    ├── preview/[id]/page.tsx
    └── history/page.tsx
```

**Route groups `(auth)` and `(dashboard)`** don't add URL segments — they let each group define its own layout. `(dashboard)/layout.tsx` guards all its children with auth.

### Data flow

```
Browser
  │  fetch(credentials: "include")
  ▼
Next.js (React Query cache)
  │
  │  hooks: useAuth, usePosters, useTemplates
  ▼
src/lib/api.ts  (fetch wrapper)
  │
  │  HTTP + httpOnly cookies
  ▼
Express API (localhost:5000)
```

React Query handles:
- Caching (`staleTime: 60s`)
- Polling (`refetchInterval` while status is `GENERATING`)
- Mutations + cache invalidation
- Optimistic updates (not used in MVP, but available)

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
│   │   ├── fonts.ts                 # next/font/local config
│   │   ├── globals.css              # Tailwind v4 + theme tokens
│   │   ├── layout.tsx               # Root layout + Providers
│   │   └── page.tsx                 # Landing page
│   ├── components/
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
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── tooltip.tsx
│   │   └── providers.tsx            # React Query + Toaster
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePosters.ts
│   │   └── useTemplates.ts
│   ├── lib/
│   │   ├── api.ts                   # fetch wrapper + typed endpoints
│   │   ├── query-client.ts          # React Query config
│   │   └── utils.ts                 # cn() and other helpers
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

**Production:** on Vercel, set `NEXT_PUBLIC_API_URL` to your Render deployment URL, e.g. `https://poster-maker-api.onrender.com/api/v1`.

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
| `/admin/*` | Auth (ADMIN) | **Deferred** — Phase 9 |

Unauthenticated users hitting `(dashboard)` routes are redirected to `/login` by the layout guard.

---

## Components

### `src/components/marketing/`

| Component | Purpose |
| :--- | :--- |
| `Navbar.tsx` | Shared marketing navbar with logo, nav links, auth-aware CTAs, mobile sheet menu |

### `src/components/poster/`

| Component | Purpose |
| :--- | :--- |
| `TemplatePicker.tsx` | Grid of selectable template cards with occasion labels |
| `PhotoUploader.tsx` | Drag-and-drop uploader with thumbnails, remove buttons, per-file validation |
| `StatusBadge.tsx` | Color-coded poster status pill (GENERATING / COMPLETED / FAILED / DRAFT) |

### `src/components/ui/`

Every component in this folder is a **shadcn copy-in** — you own the code. Edit freely. Do not treat them as a black-box library.

| Component | Used For |
| :--- | :--- |
| `alert` | Error banners in preview |
| `alert-dialog` | Delete confirmation |
| `avatar` | User initial in header |
| `badge` | Status pills |
| `button` | Everywhere |
| `card` | Form sections, dashboard tiles, history cards |
| `dialog` | (Reserved for admin CRUD) |
| `dropdown-menu` | User menu in dashboard header |
| `input` / `textarea` | Form fields |
| `label` | Form labels |
| `select` | (Reserved for occasion filter) |
| `separator` | Divider between form sections |
| `sheet` | Mobile nav drawer |
| `skeleton` | Loading placeholders |
| `sonner` | Toast host |
| `table` | (Reserved for admin) |
| `tabs` | (Reserved for admin) |
| `tooltip` | Button hints |

---

## Hooks

All hooks live in `src/hooks/` and are `"use client"`.

### `useAuth.ts`

| Hook | Returns | Notes |
| :--- | :--- | :--- |
| `useAuth()` | `{ data: User \| null, isLoading }` | Query for current user. 401 → `null`. Cached 5 min. |
| `useLogin()` | Mutation | Sets user in cache, redirects to `/dashboard` |
| `useRegister()` | Mutation | Same |
| `useLogout()` | Mutation | Clears cache, redirects to `/login` |

### `useTemplates.ts`

| Hook | Returns | Notes |
| :--- | :--- | :--- |
| `useTemplates(occasion?)` | List of templates | Optional occasion filter. Cached 5 min. |
| `useTemplate(id)` | Detail of one template | Enabled only when `id` present. |

### `usePosters.ts`

| Hook | Returns | Notes |
| :--- | :--- | :--- |
| `usePoster(id)` | Detail with polling | Polls every 2s while `GENERATING`. **Stops after 60s** (see `POLL_TIMEOUT_MS`). |
| `usePosterHistory(page, limit)` | `{ posters, meta }` | Keeps previous data while loading next page |
| `useCreatePoster()` | Mutation | Invalidates history, returns `posterId` |
| `useRegeneratePoster(id)` | Mutation | Invalidates detail |
| `useDeletePoster()` | Mutation | Invalidates entire history |
| `useUploadPhoto()` | Mutation | Wraps `uploadApi.uploadPhoto` |

---

## API Client

`src/lib/api.ts` is the **only** place that calls `fetch`. Every hook goes through it.

### Design

```ts
async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T; meta?: Meta }> {
  // ...
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

1. **`credentials: "include"`** — without this, the browser strips cookies on cross-origin calls. Localhost:3000 → localhost:5000 is cross-origin.
2. **Don't set `Content-Type` manually for `FormData` uploads** — the browser sets it with the correct multipart boundary.

### Exported API groups

| Group | Methods |
| :--- | :--- |
| `authApi` | `register`, `login`, `me`, `logout`, `refresh` |
| `templateApi` | `list`, `getById` |
| `uploadApi` | `uploadPhoto(file)` |
| `posterApi` | `create`, `getById`, `history`, `regenerate`, `delete` |

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
6. Redirect to /dashboard
       │
       ▼
7. On every protected page, useAuth() calls GET /auth/me
     → backend verifies cookie, returns user
     → if 401, returns null → (dashboard)/layout redirects to /login
```

**No tokens are stored in localStorage or memory.** All auth state lives in httpOnly cookies managed by the browser.

### Refresh strategy

The backend issues short-lived access tokens (1 day). When they expire, the client would receive a 401. For the MVP:

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

**Polling safety net:** `usePoster` stops polling after 60 seconds (`POLL_TIMEOUT_MS`) to avoid runaway requests on a stuck job. A `pollingTimedOut` flag is available for UI messaging if needed.

---

## Design System

### Theme

Defined entirely in `src/app/globals.css` via Tailwind v4's `@theme inline` directive. No `tailwind.config.js`.

**Primary color:** emerald green (`oklch(0.45 0.13 160)`) — matches the political poster palette and Bangladesh's flag.

**Accent:** warm red (`oklch(0.93 0.03 25)`) — for destructive actions and highlights.

**Neutral base:** near-white background, near-black foreground, muted grays.

**Dark mode:** tokens defined under `.dark` but no toggle is wired yet.

### Fonts

Two Bangla fonts bundled via `next/font/local`:

| Font | Variable | Used For |
| :--- | :--- | :--- |
| Anek Bangla ExtraBold | `--font-headline` | Headlines, brand wordmark |
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
| `<640px` (mobile) | Navbar collapses to hamburger + sheet. Create form single column. Template picker 2-col. History 1-col. Preview stacks. |
| `640–1024px` (tablet) | Template picker 3-col. History 2-col. Preview still stacks. |
| `>1024px` (desktop) | Create + preview get a sticky right sidebar. History 3-col. |

Key responsive classes used throughout:

```tsx
// Sidebar becomes a column below lg
<div className="grid gap-6 lg:grid-cols-[1fr_360px]">

// Sticky sidebar on desktop
<div className="lg:sticky lg:top-24 lg:self-start">
```

---

## Known Limitations

### MVP scope

These were **intentionally deferred** per the PRD Section 7 task breakdown:

| Feature | Status |
| :--- | :--- |
| Admin UI (`/admin/templates`, `/admin/posters`) | **Deferred** — API is ready on backend, no frontend pages yet |
| Moderation queue UI | **Deferred** |
| PDF export button | **Deferred** — PNG only |
| Bulk CSV generation | **Deferred** |
| Payment gateway (bKash/Nagad) | **Deferred** |
| Dark mode toggle | Tokens exist, no toggle |
| Bangla font picker for users | **Deferred** — fonts are fixed per template |
| OTP / phone login | **Deferred** |

### Technical limitations

1. **No automatic token refresh.** When the 1-day access token expires, the user is redirected to `/login`. A refresh interceptor is a Phase 2 task.

2. **No optimistic updates.** Creating a poster navigates immediately after the 202 response; the preview page shows a spinner while polling. This is fine — the alternative (fake preview) would be misleading.

3. **Images loaded from Cloudinary without `next/image`.** We use plain `<img>` because Cloudinary already serves optimized assets. If you want Next's image optimization, add `images.remotePatterns` in `next.config.ts` and swap the tags.

4. **Download relies on `a[download]`.** Some browsers ignore the `download` attribute for cross-origin URLs (Cloudinary). The image opens in a new tab instead of downloading directly. To force download, proxy through the backend or use Cloudinary's `fl_attachment` transformation.

5. **No loading skeletons for auth pages.** The login/register form appears instantly — no skeleton. Acceptable.

6. **Polling stops at 60 seconds.** If a poster is stuck GENERATING for longer (backend bug), the UI keeps showing the spinner but stops polling. A `pollingTimedOut` flag exists on the hook if you want to surface a message.

7. **No error boundaries.** A render error in a route crashes the whole app. Add `error.tsx` files per route group in Phase 2.

### Accessibility gaps

- The template picker cards are `<button>` elements with no `aria-pressed` state — the visual ring indicates selection but screen readers don't announce it.
- Photo uploader drop zone has no keyboard-focusable activation (the "browse" link inside is focusable, but the drop area itself isn't).
- No `<label>` associated with the photo input.

These are acceptable for MVP but should be addressed before any public release.

---

## Future Roadmap

### Phase 9 — Admin UI (next)

- `/admin/templates` — table view, create/edit dialog, deactivate action
- `/admin/posters` — moderation queue filtered by `isFlagged`
- Admin route group `(admin)/` with its own layout + nav
- Role check on mount — redirect non-admins to `/dashboard`

All endpoints exist on the backend. No API changes needed.

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

## Deployment (Vercel)

1. Push `frontend/` to a Git repository
2. Import into Vercel
3. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
   ```
4. Deploy

The backend must be running and reachable from Vercel's edge network. Confirm CORS on the backend allows the Vercel domain:

```
CLIENT_ORIGIN=https://your-frontend.vercel.app
```

---

## License

Internal project. Bangla fonts bundled under SIL OFL. shadcn components are MIT-licensed and copied into `src/components/ui/`.

---

## Contributors

Built during the Oct 2026 SDLC sprint as a two-project deliverable. See `../backend/README.md` for the API contract and generation pipeline details.